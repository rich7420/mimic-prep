import test from 'node:test';
import assert from 'node:assert/strict';
import { __test } from '../server/provider.mjs';

test('OpenAI-compatible fallback is restricted to response-format capability errors', () => {
  assert.equal(__test.supportsResponseFormatRetry({ statusCode: 400, message: 'Unsupported response_format json_object' }), true);
  assert.equal(__test.supportsResponseFormatRetry({ statusCode: 422, responseBody: 'unknown response format' }), true);
  assert.equal(__test.supportsResponseFormatRetry({ statusCode: 401, message: 'Unauthorized' }), false);
  assert.equal(__test.supportsResponseFormatRetry({ statusCode: 429, message: 'Rate limited' }), false);
  assert.equal(__test.supportsResponseFormatRetry({ code: 'PROVIDER_TIMEOUT', message: 'timed out' }), false);
});

test('provider JSON parser accepts plain JSON and fenced JSON', () => {
  assert.deepEqual(__test.parseJson('{"score":4}'), { score: 4 });
  assert.deepEqual(__test.parseJson('```json\n{"pass":true}\n```'), { pass: true });
});

test('local provider status is explicitly configured without pretending to call an LLM', async () => {
  const provider = await import('../server/provider.mjs');
  const status = provider.providerStatus('local');
  assert.equal(status.provider, 'local');
  assert.equal(status.configured, true);
  await assert.rejects(
    provider.callProviderJson({ provider: 'local', system: 'x', user: 'y' }),
    /does not call an LLM/
  );
});
