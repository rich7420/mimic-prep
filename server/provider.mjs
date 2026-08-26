const DEFAULT_TIMEOUT_MS = Math.max(1000, Number(process.env.LLM_TIMEOUT_MS || 90000));
const DEFAULT_MAX_TOKENS = Math.max(256, Number(process.env.LLM_MAX_TOKENS || 2400));

function stripCodeFence(text) {
  return String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function parseJson(text) {
  const cleaned = stripCodeFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('Provider did not return valid JSON.');
  }
}

function envFor(provider, requestedModel) {
  const normalized = provider || process.env.LLM_PROVIDER || 'openai-compatible';
  if (normalized === 'local') {
    return { provider: 'local', key: '', model: '', baseUrl: '' };
  }
  if (normalized === 'anthropic') {
    return {
      provider: normalized,
      key: process.env.ANTHROPIC_API_KEY || process.env.LLM_API_KEY || '',
      model: requestedModel || process.env.ANTHROPIC_MODEL || process.env.LLM_MODEL || '',
      baseUrl: (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '')
    };
  }
  if (normalized === 'gemini') {
    return {
      provider: normalized,
      key: process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
      model: requestedModel || process.env.GEMINI_MODEL || process.env.LLM_MODEL || '',
      baseUrl: (process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '')
    };
  }
  return {
    provider: 'openai-compatible',
    key: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '',
    model: requestedModel || process.env.OPENAI_MODEL || process.env.LLM_MODEL || '',
    baseUrl: (process.env.OPENAI_BASE_URL || process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  };
}

async function fetchJson(url, options, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(`Provider request failed (${response.status}): ${text.slice(0, 500)}`);
      error.statusCode = response.status;
      error.responseBody = text;
      throw error;
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Provider returned non-JSON HTTP content: ${text.slice(0, 300)}`);
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(`Provider request timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
      timeoutError.code = 'PROVIDER_TIMEOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function supportsResponseFormatRetry(error) {
  if (![400, 422].includes(error?.statusCode)) return false;
  return /response[_ -]?format|json[_ -]?object|unsupported.*json|unknown.*response/i.test(`${error.message || ''} ${error.responseBody || ''}`);
}

async function callOpenAICompatible(config, { system, user, temperature }) {
  const body = {
    model: config.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature,
    max_tokens: DEFAULT_MAX_TOKENS,
    response_format: { type: 'json_object' }
  };

  let payload;
  try {
    payload = await fetchJson(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.key ? { Authorization: `Bearer ${config.key}` } : {})
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    if (!supportsResponseFormatRetry(error)) throw error;
    const fallbackBody = { ...body };
    delete fallbackBody.response_format;
    payload = await fetchJson(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.key ? { Authorization: `Bearer ${config.key}` } : {})
      },
      body: JSON.stringify(fallbackBody)
    });
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI-compatible response contained no message content.');
  return parseJson(content);
}

async function callAnthropic(config, { system, user, temperature }) {
  const payload = await fetchJson(`${config.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.key,
      'anthropic-version': process.env.ANTHROPIC_VERSION || '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: DEFAULT_MAX_TOKENS,
      temperature,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });
  const content = payload.content?.find((part) => part.type === 'text')?.text;
  if (!content) throw new Error('Anthropic response contained no text content.');
  return parseJson(content);
}

async function callGemini(config, { system, user, temperature }) {
  const url = `${config.baseUrl}/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(config.key)}`;
  const payload = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: DEFAULT_MAX_TOKENS,
        responseMimeType: 'application/json'
      }
    })
  });
  const content = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
  if (!content) throw new Error('Gemini response contained no text content.');
  return parseJson(content);
}

export function providerStatus(provider, requestedModel) {
  const config = envFor(provider, requestedModel);
  if (config.provider === 'local') {
    return { provider: 'local', model: '', baseUrl: '', configured: true, timeoutMs: 0, maxTokens: 0 };
  }
  const requiresKey = config.provider !== 'openai-compatible' || !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(config.baseUrl);
  return {
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl,
    configured: Boolean(config.model && (!requiresKey || config.key)),
    timeoutMs: DEFAULT_TIMEOUT_MS,
    maxTokens: DEFAULT_MAX_TOKENS
  };
}

export async function callProviderJson({ provider, model, system, user, temperature = 0 }) {
  const config = envFor(provider, model);
  if (config.provider === 'local') {
    throw new Error('The local provider does not call an LLM. Use the local item bank or local diagnostics directly.');
  }
  if (!providerStatus(provider, model).configured) {
    throw new Error(`Provider ${config.provider} is not configured. Set the corresponding server-side API key and model.`);
  }
  if (config.provider === 'anthropic') return callAnthropic(config, { system, user, temperature });
  if (config.provider === 'gemini') return callGemini(config, { system, user, temperature });
  return callOpenAICompatible(config, { system, user, temperature });
}

export const __test = { parseJson, supportsResponseFormatRetry };
