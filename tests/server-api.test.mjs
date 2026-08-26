import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const port = 43000 + Math.floor(Math.random() * 1000);
const origin = `http://127.0.0.1:${port}`;
let output = '';
const server = spawn(process.execPath, ['server.mjs'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', LLM_PROVIDER: 'local' },
  stdio: ['ignore', 'pipe', 'pipe']
});
server.stdout.on('data', (chunk) => { output += chunk; });
server.stderr.on('data', (chunk) => { output += chunk; });

async function waitForServer() {
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    if (server.exitCode != null) throw new Error(`Server exited before readiness.\n${output}`);
    try {
      const response = await fetch(`${origin}/api/health?provider=local`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error(`Timed out waiting for test server.\n${output}`);
}

await waitForServer();

test.after(async () => {
  if (server.exitCode == null) server.kill('SIGTERM');
  await Promise.race([once(server, 'exit'), new Promise((resolve) => setTimeout(resolve, 2000))]);
});

test('server exposes versioned health, coverage, source registry, and blueprints', async () => {
  const healthResponse = await fetch(`${origin}/api/health?provider=local`);
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(health.appVersion, '6.0.0');
  assert.equal(health.configured, true);

  const coverage = await (await fetch(`${origin}/api/content/coverage`)).json();
  assert.equal(coverage.releaseGate.structuralPass, true);
  assert.equal(coverage.counts.readingForms, 2);
  assert.equal(coverage.editorialCoverageScore, 100);
  assert.equal(coverage.psychometricCalibration.status, 'not-calibrated');

  const sources = await (await fetch(`${origin}/api/content/sources`)).json();
  assert.equal(sources.sources.length, 15);
  assert.ok(sources.policy.prohibitedProvenance.includes('recalled-live-item'));

  const blueprints = await (await fetch(`${origin}/api/content/blueprints`)).json();
  assert.deepEqual(blueprints.tasks.daily.constraints.questionsPerStimulus, [2, 3]);
  assert.equal(blueprints.tasks.email.constraints.minimumWordCount, null);
});

test('local generation endpoint returns structurally validated items for all six task families', async () => {
  for (const taskType of ['ctw', 'daily', 'academic', 'build', 'email', 'discussion']) {
    const response = await fetch(`${origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskType, provider: 'local' })
    });
    const payload = await response.json();
    assert.equal(response.status, 200, `${taskType}: ${JSON.stringify(payload)}`);
    assert.equal(payload.source, 'local_bank');
    assert.ok(payload.item?.id, `${taskType} item should have an id`);
  }
});

test('server rejects unsupported generation types and encoded path traversal', async () => {
  const invalid = await fetch(`${origin}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskType: 'live-item-recall', provider: 'local' })
  });
  assert.equal(invalid.status, 400);

  const traversal = await fetch(`${origin}/..%2Fpackage.json`);
  assert.equal(traversal.status, 403);

  const head = await fetch(`${origin}/`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.match(head.headers.get('content-security-policy') || '', /default-src 'self'/);
  assert.equal(head.headers.get('x-content-type-options'), 'nosniff');
});
