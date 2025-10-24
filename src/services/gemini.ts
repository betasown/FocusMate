import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Allow overriding the full endpoint via env; default kept but we'll handle 404s gracefully
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const GEMINI_API_ROOT = process.env.GEMINI_API_ROOT || 'https://generativelanguage.googleapis.com';

if (!GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not set - /define commands will fallback to a safe message');
}

/**
 * Call Gemini API to get a one-sentence definition of a keyword
 */
export async function defineKeyword(keyword: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // First try to use the official SDK if available; otherwise fallback to REST calls.
  try {
    // dynamic import so it only fails if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const sdkResp: any = await ai.models.generateContent({
      model: process.env.GEMINI_SDK_MODEL || 'gemini-2.5-flash',
      contents: [{ text: `Définis en une phrase courte et claire : ${keyword}` }],
    });
    // SDK shapes may differ; try to extract text
    const sdkText = sdkResp?.candidates?.[0]?.content?.[0]?.text || sdkResp?.text || sdkResp?.output?.[0]?.content?.text;
    if (sdkText) return String(sdkText).trim();
  } catch (sdkErr) {
    // Ignore SDK errors and fallback to axios logic below
    console.info('@google/genai SDK not available or failed, falling back to REST. (masked)');
  }

  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Définis en une phrase courte et claire : ${keyword}`
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text in Gemini response');
    }

    return text.trim();
  } catch (error: any) {
    const apiErr = error.response?.data || error.message || error;
    console.error('Gemini API error:', apiErr);

    // If the model is not found (404), try listing available models and retry with a candidate
    if (error.response?.status === 404) {
        console.warn('Gemini model not found for configured endpoint. Trying ListModels to discover available models...');
      try {
        const listUrl = `${GEMINI_API_ROOT}/v1/models?key=${GEMINI_API_KEY}`;
        const listResp = await axios.get(listUrl, { timeout: 5000 });
        const models: any[] = listResp.data?.models || [];
          // prefer models containing 'gemini'
          const names = models.map(m => m.name || m).filter(Boolean);
          console.info('Discovered Gemini models:', names);
          const candidate = names.find((n: string) => /gemini/i.test(n));
        if (candidate) {
          try {
            const rawCandidate = candidate as string;
            const candidateHasPrefix = rawCandidate.startsWith('models/');

            const endpointPaths = candidateHasPrefix
              ? [
                  `${GEMINI_API_ROOT}/v1/${rawCandidate}:generateContent`,
                  `${GEMINI_API_ROOT}/v1/${rawCandidate}:generateText`,
                  `${GEMINI_API_ROOT}/v1/${rawCandidate}:predict`,
                ]
              : [
                  `${GEMINI_API_ROOT}/v1/models/${rawCandidate}:generateContent`,
                  `${GEMINI_API_ROOT}/v1/models/${rawCandidate}:generateText`,
                  `${GEMINI_API_ROOT}/v1/models/${rawCandidate}:predict`,
                ];

            for (const baseAttempt of endpointPaths) {
              const urlAttempt = `${baseAttempt}?key=${GEMINI_API_KEY}`;
              try {
                const retryResp = await axios.post(urlAttempt, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
                const text2 = retryResp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text2) return text2.trim();
              } catch (attemptErr: any) {
                const safePath = baseAttempt.replace(GEMINI_API_ROOT, '') + '?key=REDACTED';
                console.warn(`Gemini retry attempt failed for ${safePath}:`, attemptErr?.response?.status || attemptErr?.message || attemptErr);
                // continue to next attempt
              }
            }
          } catch (e) {
            const errAny: any = e;
            console.error('Retry with discovered model failed:', errAny?.response?.data || errAny?.message || errAny);
          }
        } else {
          console.warn('No candidate Gemini model found in ListModels response.');
        }
      } catch (listErr) {
        const listAny: any = listErr;
        console.error('ListModels failed:', listAny?.response?.data || listAny?.message || listAny);
      }

        return `Définition temporairement indisponible pour "${keyword}" (API Gemini non disponible).`;
    }

    // Other errors: return a fallback message instead of throwing to keep UX smooth
    return `Définition indisponible pour "${keyword}" (erreur externe).`;
  }
}

/**
 * Call Gemini API to get definitions for multiple keywords at once
 */
export async function defineBulkKeywords(keywords: string[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Try SDK first
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const sdkResp: any = await ai.models.generateContent({
      model: process.env.GEMINI_SDK_MODEL || 'gemini-2.5-flash',
      contents: [{ text: `Définis chacun des mots-clés suivants en une phrase courte et claire. Réponds avec une liste numérotée :\n\n${keywords.map((k,i)=>`${i+1}. ${k}`).join('\n')}` }],
    });
    const sdkText = sdkResp?.candidates?.[0]?.content?.[0]?.text || sdkResp?.text || sdkResp?.output?.[0]?.content?.text;
    if (sdkText) return String(sdkText).trim();
  } catch (sdkErr) {
    console.info('@google/genai SDK not available or failed for bulk call, falling back to REST. (masked)');
  }

  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

  // Build numbered list prompt
  const numberedList = keywords.map((kw, i) => `${i + 1}. ${kw}`).join('\n');
  const prompt = `Définis chacun des mots-clés suivants en une phrase courte et claire. Réponds avec une liste numérotée :\n\n${numberedList}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text in Gemini response');
    }

    return text.trim();
  } catch (error: any) {
    const apiErr = error.response?.data || error.message || error;
    console.error('Gemini API error:', apiErr);

    if (error.response?.status === 404) {
      console.warn('Gemini model not found for configured endpoint. Attempting ListModels...');
      try {
        const listUrl = `${GEMINI_API_ROOT}/v1/models?key=${GEMINI_API_KEY}`;
        const listResp = await axios.get(listUrl, { timeout: 5000 });
        const models: any[] = listResp.data?.models || [];
        const candidate = models.map(m => m.name || m).find((n: string) => /gemini/i.test(n));
        if (candidate) {
          try {
            const rawCandidate = (candidate as string);
            const candidateHasPrefix = rawCandidate.startsWith('models/');
            const endpointPaths = candidateHasPrefix
              ? [
                  `${GEMINI_API_ROOT}/v1/${rawCandidate}:generateContent`,
                  `${GEMINI_API_ROOT}/v1/${rawCandidate}:generateText`,
                  `${GEMINI_API_ROOT}/v1/${rawCandidate}:predict`,
                ]
              : [
                  `${GEMINI_API_ROOT}/v1/models/${rawCandidate}:generateContent`,
                  `${GEMINI_API_ROOT}/v1/models/${rawCandidate}:generateText`,
                  `${GEMINI_API_ROOT}/v1/models/${rawCandidate}:predict`,
                ];

            for (const baseAttempt of endpointPaths) {
              const urlAttempt = `${baseAttempt}?key=${GEMINI_API_KEY}`;
              try {
                const retryResp = await axios.post(urlAttempt, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
                const text2 = retryResp.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text2) return text2.trim();
              } catch (attemptErr: any) {
                const safePath = baseAttempt.replace(GEMINI_API_ROOT, '') + '?key=REDACTED';
                console.warn(`Gemini retry attempt failed for ${safePath}:`, attemptErr?.response?.status || attemptErr?.message || attemptErr);
                // continue
              }
            }
          } catch (e) {
            const errAny: any = e;
            console.error('Retry with discovered model failed:', errAny?.response?.data || errAny?.message || errAny);
          }
        } else {
          console.warn('No candidate Gemini model found in ListModels response.');
        }
      } catch (listErr) {
        const listAny: any = listErr;
        console.error('ListModels failed:', listAny?.response?.data || listAny?.message || listAny);
      }

      return `Définitions temporairement indisponibles (API Gemini non disponible).`;
    }

    return `Définitions indisponibles (erreur externe).`;
  }
}
