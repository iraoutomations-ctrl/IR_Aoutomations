/* ==========================================================================
   autoRI-studio CRM - Shared Gemini API client with retry + model fallback
   ========================================================================== */

// Mirrors the pattern the n8n chatbot workflow already uses in production:
// try the fast Flash model first, and if it's overloaded/rate-limited, retry
// briefly then fall back to the Pro model rather than surfacing a hard failure
// to the user for what is usually a temporary demand spike.
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-pro-latest'];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 503 = model temporarily overloaded ("high demand"), 429 = rate limited.
// Both are worth retrying/falling back on; other statuses (400 bad request,
// 403 bad key, etc.) are not - retrying those would just waste time.
const isRetryableStatus = (status) => status === 503 || status === 429;

/**
 * Calls the Gemini generateContent endpoint with automatic retry and model
 * fallback on overload/rate-limit responses. Returns the raw fetch Response
 * (not parsed JSON) so callers keep their existing .ok / .json() handling.
 *
 * @param {object} requestBody - the Gemini API request body (contents, generationConfig, etc.)
 * @param {string} apiKey
 * @param {{timeoutMs?: number, retriesPerModel?: number}} [options]
 */
export async function callGeminiWithFallback(requestBody, apiKey, options = {}) {
    const { timeoutMs = 30000, retriesPerModel = 1 } = options;
    let lastError = null;

    for (const model of FALLBACK_MODELS) {
        for (let attempt = 0; attempt <= retriesPerModel; attempt++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody),
                        signal: controller.signal
                    }
                );
                clearTimeout(timeoutId);

                if (isRetryableStatus(response.status)) {
                    lastError = new Error(`מודל ${model} עמוס כרגע (קוד ${response.status}).`);
                    if (attempt < retriesPerModel) {
                        await sleep(800 * (attempt + 1));
                        continue;
                    }
                    break; // exhausted retries for this model - try the next one
                }

                // Any other outcome (success, or a non-retryable error like 400/403)
                // is returned as-is for the caller to handle.
                return response;
            } catch (err) {
                clearTimeout(timeoutId);
                lastError = err.name === 'AbortError'
                    ? new Error(`הפנייה למודל ${model} חרגה מהזמן הקצוב (${timeoutMs / 1000} שניות).`)
                    : err;
                if (attempt < retriesPerModel) {
                    await sleep(800 * (attempt + 1));
                    continue;
                }
            }
        }
    }

    throw lastError || new Error('כל הקריאות ל-Gemini נכשלו.');
}
