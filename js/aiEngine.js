/**
 * LexiBridge Unified Multi-Provider AI Engine
 * Compatible with SM Studio architecture.
 * Supports:
 *  1. Google Gemini REST API (gemini-flash-latest, 3.8-flash, 3.1-pro, etc.)
 *  2. NVIDIA NIM OpenAI-Compatible API (Nemotron 70B, Mistral Large 2, DeepSeek-R1)
 *  3. Yerel LLM (Ollama / LM Studio via OpenAI-compatible endpoint)
 *  4. Quick REST Çeviri (Google Translate REST - 0 API Key Instant Fallback)
 */

const AIEngine = (function () {
  // Default Keys loaded from local untracked config (config.local.js) or empty
  const SM_STUDIO_KEYS = (typeof window !== "undefined" && window.LEXI_PRESET_KEYS) ? window.LEXI_PRESET_KEYS : {
    google: "",
    nvidia: ""
  };

  const PROVIDERS = {
    google: {
      id: "google",
      name: "Google Gemini",
      icon: "🔵",
      badge: "Google Cloud",
      default_model: "gemini-3.5-flash-lite",
      models: [
        { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite (Ultra Hızlı - 800ms)", badge: "⚡ Hızlı" },
        { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash (Detaylı & Dengeli)", badge: "💎 Dengeli" }
      ]
    },
    nvidia: {
      id: "nvidia",
      name: "NVIDIA NIM",
      icon: "🟢",
      badge: "NVIDIA AI",
      default_model: "nvidia/llama-3.1-nemotron-70b-instruct",
      models: [
        { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B (NVIDIA Özel Model)", badge: "⚡ Önerilen" },
        { id: "mistralai/mistral-large-2-instruct", name: "Mistral Large 2 (Gelişmiş Çok Dilli)", badge: "🌍 Çok Dilli" },
        { id: "deepseek-ai/deepseek-r1", name: "DeepSeek-R1 (Derin Akıl Yürütme & Gramer)", badge: "🧠 Zeka Devi" }
      ]
    },
    local: {
      id: "local",
      name: "Yerel LLM (Ollama)",
      icon: "🏠",
      badge: "Termux / Localhost",
      default_model: "llama3.2:1b",
      default_url: "http://127.0.0.1:11434/v1",
      models: [
        { id: "llama3.2:1b", name: "Llama 3.2 1B (Ultra Hızlı - Termux)", badge: "⚡ 1.3 GB" },
        { id: "llama3.2:3b", name: "Llama 3.2 3B (Dengeli - Termux)", badge: "📱 2.0 GB" },
        { id: "qwen2.5:1.5b", name: "Qwen 2.5 1.5B (Çok Dilli - Termux)", badge: "🌍 1.0 GB" },
        { id: "qwen2.5:3b", name: "Qwen 2.5 3B (Çok Dilli Zeka)", badge: "💎 2.2 GB" },
        { id: "llama3.2", name: "Llama 3.2 (Varsayılan)", badge: "🏠 Local" },
        { id: "mistral", name: "Mistral 7B (PC / Yüksek RAM)", badge: "💻 4.1 GB" },
        { id: "custom", name: "Özel Model", badge: "⚙️ Özel" }
      ]
    },
    quick_rest: {
      id: "quick_rest",
      name: "Hızlı REST (0 API Key)",
      icon: "⚡",
      badge: "Sıfır Key",
      default_model: "google-gtx",
      models: [
        { id: "google-gtx", name: "Google Translate REST (Anında)", badge: "⚡ 0 Key" }
      ]
    }
  };

  const SYSTEM_PROMPT = `Sen Hollandaca ve Türkçe dillerine son derece hakim, uzman bir dilbilimci ve sözlük bilimcisin.
Sana verilen kelime, kelime grubu, deyim veya cümleyi en doğru şekilde analiz etmeli ve istenen JSON formatında, yapılandırılmış olarak döndürmelisin.

ÖNEMLİ KURALLAR:
1. Yalnızca geçerli bir JSON objesi döndür, markdown işaretleri (\`\`\`json vb.) veya açıklama KULLANMA.
2. Uydurma bilgi verme. Emin olmadığın etimolojiyi "certainty": "unknown" olarak işaretle.
3. Kelimenin kullanım bağlamına çok dikkat et. En yaygın anlamları (very_common / common) en üstte ver.
4. Örnek cümlelerin tamamen doğal ve günlük Felemenkçe/Türkçe konuşmaya uygun olmasına özen göster.
5. JSON yapısı şu şemaya KESİNLİKLE uymalıdır:

{
  "input": "kullanıcının girdiği ifade",
  "sourceLanguage": "nl veya tr",
  "targetLanguage": "nl veya tr",
  "pronunciation": {
    "ipa": "/.../",
    "simplified": "..."
  },
  "partOfSpeech": "noun, verb, adjective, adverb, expression, sentence vb.",
  "translations": [
    {
      "text": "ana çeviri",
      "context": "bağlam",
      "frequency": "very_common | common | less_common | rare"
    }
  ],
  "meanings": [
    {
      "meaning": "anlam açıklaması",
      "explanation": "detaylı açıklama",
      "context": "kullanım bağlamı"
    }
  ],
  "grammar": {
    "article": "de / het (Hollandaca ise)",
    "plural": "çoğul hali",
    "infinitive": "mastar",
    "register": "informal / formal / slang vb.",
    "notes": ["ekstra gramer notları"]
  },
  "etymology": {
    "summary": "kelime kökeni özeti",
    "certainty": "high | medium | low | unknown"
  },
  "examples": [
    {
      "source": "kaynak dilde örnek cümle",
      "translation": "hedef dilde çevirisi"
    }
  ],
  "relatedWords": [
    {
      "word": "kelime",
      "relation": "synonym | antonym | related"
    }
  ]
}`;

  // Device detection helper (Android / Termux / Mobile Phone vs PC)
  function isMobileDevice() {
    if (typeof navigator === "undefined") return false;
    const ua = (navigator.userAgent || navigator.vendor || window.opera || "").toLowerCase();
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isSmallScreen = typeof window !== "undefined" && window.innerWidth <= 800;
    const isTouch = typeof navigator !== "undefined" && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    return isMobileUA || (isTouch && isSmallScreen);
  }

  // Auto-fetch models installed in Ollama via /api/tags or /v1/models
  async function fetchInstalledLocalModels(baseUrl) {
    const cleanBase = (baseUrl || "http://127.0.0.1:11434/v1").replace(/\/+$/, "");
    const rootBase = cleanBase.replace(/\/v1$/, "");

    // 1. Try native Ollama endpoint /api/tags
    try {
      const resp = await fetch(`${rootBase}/api/tags`, { method: "GET" });
      if (resp.ok) {
        const data = await resp.json();
        if (data && Array.isArray(data.models) && data.models.length > 0) {
          return data.models.map(m => {
            const rawName = m.name || m.model || "unknown";
            const sizeGb = m.size ? ` (${(m.size / (1024 * 1024 * 1024)).toFixed(1)} GB)` : "";
            return {
              id: rawName,
              name: `${rawName}${sizeGb}`,
              badge: "🟢 Yüklü"
            };
          });
        }
      }
    } catch (e) {
      // ignore, try fallback
    }

    // 2. Try OpenAI-compatible /v1/models
    try {
      const resp = await fetch(`${cleanBase}/models`, { method: "GET" });
      if (resp.ok) {
        const data = await resp.json();
        const list = data?.data || data?.models;
        if (Array.isArray(list) && list.length > 0) {
          return list.map(m => {
            const id = m.id || m.name;
            return {
              id: id,
              name: id,
              badge: "🟢 Yüklü"
            };
          });
        }
      }
    } catch (e) {
      // ignore
    }

    return null;
  }

  // Helper to load settings (Phone defaults to Local Ollama; PC defaults to Google Gemini)
  function getSettings() {
    const isMobile = isMobileDevice();
    const defaultProvider = isMobile ? "local" : "google";
    const userChosen = localStorage.getItem("lexi_provider_user_chosen") === "true";
    const savedProvider = localStorage.getItem("lexi_provider");
    const activeProvider = (userChosen && savedProvider) ? savedProvider : defaultProvider;

    let savedModel = localStorage.getItem("lexi_model");
    if (!savedModel || savedModel.includes("latest") || savedModel.includes("pro") || savedModel.includes("3.8") || savedModel.includes("3.6") || savedModel.includes("2.5")) {
      savedModel = activeProvider === "local"
        ? (localStorage.getItem("local_llm_model") || PROVIDERS.local.default_model)
        : "gemini-3.5-flash-lite";
      localStorage.setItem("lexi_model", savedModel);
    }
    let googleKey = localStorage.getItem("gemini_api_key");
    if (!googleKey) {
      googleKey = SM_STUDIO_KEYS.google;
      if (googleKey) localStorage.setItem("gemini_api_key", googleKey);
    }
    let savedLocalUrl = localStorage.getItem("local_llm_url");
    if (!savedLocalUrl || savedLocalUrl.includes("localhost")) {
      savedLocalUrl = PROVIDERS.local.default_url; // "http://127.0.0.1:11434/v1"
      localStorage.setItem("local_llm_url", savedLocalUrl);
    }
    return {
      isMobile,
      provider: activeProvider,
      model: savedModel,
      googleKey: googleKey || "",
      nvidiaKey: localStorage.getItem("nvidia_api_key") || SM_STUDIO_KEYS.nvidia,
      localUrl: savedLocalUrl,
      localModel: localStorage.getItem("local_llm_model") || (isMobile ? "llama3.2:1b" : PROVIDERS.local.default_model)
    };
  }

  function saveSettings(settings) {
    if (settings.provider) {
      localStorage.setItem("lexi_provider", settings.provider);
      localStorage.setItem("lexi_provider_user_chosen", "true");
    }
    if (settings.model) localStorage.setItem("lexi_model", settings.model);
    if (settings.googleKey !== undefined) localStorage.setItem("gemini_api_key", settings.googleKey.trim());
    if (settings.nvidiaKey !== undefined) localStorage.setItem("nvidia_api_key", settings.nvidiaKey.trim());
    if (settings.localUrl !== undefined) localStorage.setItem("local_llm_url", settings.localUrl.trim());
    if (settings.localModel !== undefined) localStorage.setItem("local_llm_model", settings.localModel.trim());
  }

  // Robust JSON cleaner & parser
  function parseJSONResponse(rawText) {
    let clean = (rawText || "").trim();
    // 1. Try markdown code block extraction
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) {
      clean = match[1].trim();
    } else {
      // 2. Try finding outermost braces
      const first = clean.indexOf("{");
      const last = clean.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        clean = clean.substring(first, last + 1);
      }
    }
    return JSON.parse(clean);
  }

  // Quick Google Translate REST call (0 API key fallback)
  async function quickTranslateRest(query, sourceLang, targetLang) {
    const sl = sourceLang === "nl" ? "nl" : "tr";
    const tl = targetLang === "nl" ? "nl" : "tr";
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(query)}`;
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`REST Çeviri hatası: ${resp.status}`);
    const data = await resp.json();
    
    let translated = "";
    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      translated = data[0].map(item => item[0]).filter(Boolean).join("").trim();
    }

    return {
      input: query,
      sourceLanguage: sl,
      targetLanguage: tl,
      translations: [{ text: translated || query, frequency: "common" }],
      meanings: [{ meaning: translated }],
      partOfSpeech: "expression",
      examples: [],
      relatedWords: [],
      _isQuickRest: true
    };
  }

  // Google Gemini API call (Optimized for Sub-Second Latency)
  async function callGoogleGemini(query, sourceLang, model, apiKey) {
    if (!apiKey) throw new Error("Google Gemini API anahtarı girilmedi.");
    const targetLang = sourceLang === "nl" ? "tr" : "nl";
    const userPrompt = `Lütfen şu girdiyi analiz et. Girdi dili: ${sourceLang.toUpperCase()}, Hedef dil: ${targetLang.toUpperCase()}. Girdi: "${query}"`;
    
    let activeModel = model;
    if (!activeModel || activeModel.includes("latest") || activeModel.includes("pro") || activeModel.includes("3.8") || activeModel.includes("3.6") || activeModel.includes("2.5")) {
      activeModel = "gemini-3.5-flash-lite";
    }

    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json"
      }
    };

    let url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
    let resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Fast Single Fallback if 429 quota or 503 busy
    if (!resp.ok && (resp.status === 429 || resp.status === 503 || resp.status === 404)) {
      const fbModel = activeModel === "gemini-3.5-flash-lite" ? "gemini-3.5-flash" : "gemini-3.5-flash-lite";
      const fbUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fbModel}:generateContent?key=${apiKey}`;
      const fbResp = await fetch(fbUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (fbResp.ok) {
        resp = fbResp;
        activeModel = fbModel;
      }
    }

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Google API Hatası (${resp.status})`);
    }

    const data = await resp.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResult) throw new Error("Modelden geçerli bir metin yanıtı alınamadı.");

    const parsed = parseJSONResponse(textResult);
    parsed._provider = "Google Gemini (" + activeModel + ")";
    return parsed;
  }

  // NVIDIA NIM API call (OpenAI compatible)
  async function callNvidiaNIM(query, sourceLang, model, apiKey) {
    if (!apiKey) throw new Error("NVIDIA NIM API anahtarı girilmedi.");
    const targetLang = sourceLang === "nl" ? "tr" : "nl";
    const userPrompt = `Lütfen şu girdiyi analiz et. Girdi dili: ${sourceLang.toUpperCase()}, Hedef dil: ${targetLang.toUpperCase()}. Girdi: "${query}"`;
    
    const activeModel = model || "nvidia/llama-3.1-nemotron-70b-instruct";
    const url = "https://integrate.api.nvidia.com/v1/chat/completions";
    const payload = {
      model: activeModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2048
    };

    let resp;
    try {
      resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
    } catch (netErr) {
      throw new Error(
        "NVIDIA NIM API'si güvenlik politikası (CORS) gereği doğrudan web tarayıcısından çağrılmaya izin vermemektedir (Python/Backend gerektirir). Tarayıcıda çalışmak için lütfen Ayarlar'dan 'Google Gemini' veya 'Hızlı REST' sağlayıcısını seçiniz."
      );
    }

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.detail || `NVIDIA Hatası (${resp.status})`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("NVIDIA modelinden boş yanıt döndü.");

    const parsed = parseJSONResponse(content);
    parsed._provider = "NVIDIA NIM (" + activeModel.split("/").pop() + ")";
    return parsed;
  }

  // Yerel LLM (Ollama / Termux / Localhost)
  async function callLocalLLM(query, sourceLang, model, baseUrl) {
    const targetLang = sourceLang === "nl" ? "tr" : "nl";
    const userPrompt = `Lütfen şu girdiyi analiz et. Girdi dili: ${sourceLang.toUpperCase()}, Hedef dil: ${targetLang.toUpperCase()}. Girdi: "${query}"`;
    
    const activeModel = model || (isMobileDevice() ? "llama3.2:1b" : PROVIDERS.local.default_model);
    let cleanBase = (baseUrl || PROVIDERS.local.default_url).trim().replace(/\/+$/, "");
    if (!cleanBase.endsWith("/v1")) {
      cleanBase = cleanBase + "/v1";
    }

    const payload = {
      model: activeModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      stream: false,
      max_tokens: 2048
    };

    let resp;
    let targetBase = cleanBase;

    async function attemptFetch(base) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      try {
        const r = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return r;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    }

    try {
      resp = await attemptFetch(targetBase);
    } catch (e1) {
      // If 127.0.0.1 failed, try localhost (or vice versa)
      const altBase = targetBase.includes("127.0.0.1")
        ? targetBase.replace("127.0.0.1", "localhost")
        : targetBase.replace("localhost", "127.0.0.1");
      try {
        resp = await attemptFetch(altBase);
      } catch (e2) {
        throw new Error(
          `Yerel LLM bağlantı hatası (${cleanBase}). Termux'ta Ollama'nın çalıştığından ve OLLAMA_ORIGINS="*" ayarlı olduğundan emin olun. Detay: ${e1.message}`
        );
      }
    }

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const errMsg = err?.error?.message || err?.error || `HTTP ${resp.status}`;
      if (resp.status === 404 || errMsg.toLowerCase().includes("not found")) {
        throw new Error(
          `'${activeModel}' modeli Ollama'da bulunamadı. Termux'ta 'ollama pull ${activeModel}' komutuyla indirebilir veya Ayarlar'dan yüklü başka bir model seçebilirsiniz.`
        );
      }
      throw new Error(`Yerel LLM Hatası (${resp.status}): ${errMsg}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Yerel modelden boş yanıt döndü.");

    const parsed = parseJSONResponse(content);
    parsed._provider = "Yerel LLM (" + activeModel + ")";
    return parsed;
  }

  // Main analyze dispatcher with Smart Hybrid Fallback (Ollama -> Google Gemini -> Quick REST)
  async function analyze(query, sourceLang) {
    const cleanQuery = (query || "").trim();
    if (!cleanQuery) throw new Error("Lütfen bir kelime veya cümle girin.");

    const settings = getSettings();
    const provider = settings.provider || "google";
    const targetLang = sourceLang === "nl" ? "tr" : "nl";

    if (provider === "quick_rest") {
      return await quickTranslateRest(cleanQuery, sourceLang, targetLang);
    }

    try {
      if (provider === "nvidia") {
        return await callNvidiaNIM(cleanQuery, sourceLang, settings.model, settings.nvidiaKey);
      } else if (provider === "local") {
        // Smart Hybrid: Try local Ollama first; if unreachable/offline, fallback seamlessly to cloud
        try {
          return await callLocalLLM(cleanQuery, sourceLang, settings.localModel, settings.localUrl);
        } catch (localErr) {
          console.warn("Yerel Ollama'ya ulaşılamadı. Akıllı hibrit yedek devreye giriyor:", localErr.message);
          // Fallback 1: Google Gemini (High-speed linguistic AI)
          try {
            const geminiResult = await callGoogleGemini(cleanQuery, sourceLang, "gemini-3.5-flash-lite", settings.googleKey);
            geminiResult._provider = "Google Gemini (Ollama Çevrimdışı)";
            geminiResult._fallbackFrom = "local";
            geminiResult._localError = localErr.message;
            return geminiResult;
          } catch (geminiErr) {
            console.warn("Google Gemini de yanıt vermedi, Hızlı REST yedeğe geçiliyor:", geminiErr.message);
            // Fallback 2: Quick REST (0 API Key, reliable fallback)
            const restResult = await quickTranslateRest(cleanQuery, sourceLang, targetLang);
            restResult._provider = "Hızlı REST (Ollama & Gemini Çevrimdışı)";
            restResult._fallbackFrom = "local";
            restResult._localError = localErr.message;
            return restResult;
          }
        }
      } else {
        // default google
        return await callGoogleGemini(cleanQuery, sourceLang, settings.model, settings.googleKey);
      }
    } catch (err) {
      console.warn("AI Sağlayıcı hatası:", err);
      throw err;
    }
  }

  return {
    PROVIDERS,
    SM_STUDIO_KEYS,
    isMobileDevice,
    fetchInstalledLocalModels,
    getSettings,
    saveSettings,
    analyze,
    quickTranslateRest
  };
})();
