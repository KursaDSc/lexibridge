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

ÖNEMLİ VE KESİN KURALLAR:
1. DEYİM, ATASÖZÜ VE MECAZİ İFADELERDE ÖNCELİK KURALI (EN YÜKSEK ÖNCELİK):
   - Eğer girdi bir deyim (idiom), atasözü (proverb), kalıplaşmış ifade (expression) veya mecazi kelime grubu ise:
     a) KELİMESİ KELİMESİNE (MOTOMOT / LİTERAL) ÇEVİRİ ASLA VE ASLA ANA ÇEVİRİ YAPILAMAZ!
     b) "translations[0].text" (Ana Çeviri) ve "meanings[0].meaning" KESİNLİKLE deyimin hedef dildeki gerçek mecazi anlamı ve en uygun deyimsel dengi olmalıdır.
        * Örnek (NL->TR): "de kat uit de boom kijken" -> Ana Çeviri: "durumu uzaktan izlemek / acele etmeyip bekleyip görmek" (ASLA "ağaçtaki kediyi izlemek" DEĞİL!).
        * Örnek (NL->TR): "nu komt de aap uit de mouw" -> Ana Çeviri: "işin aslı ortaya çıktı / baklayı ağzından çıkardı" (ASLA "maymun koldan çıkıyor" DEĞİL!).
        * Örnek (NL->TR): "over koetjes en kalfjes praten" -> Ana Çeviri: "havadan sudan konuşmak / önemsiz şeylerden bahsetmek" (ASLA "küçük inekler ve buzağılardan konuşmak" DEĞİL!).
        * Örnek (NL->TR): "een appeltje met iemand te schillen hebben" -> Ana Çeviri: "biriyle görülecek bir hesabı olmak" (ASLA "biriyle elma soymak" DEĞİL!).
        * Örnek (TR->NL): "göz boyamak" -> Ana Çeviri: "zand in de ogen strooien / misleiden" (ASLA "bir göz boyamak" DEĞİL!).
        * Örnek (TR->NL): "çantada keklik" -> Ana Çeviri: "een koud kunstje / een voldongen feit / gegarandeerd succes" (ASLA "çantadaki keklik" DEĞİL!).
     c) Kelimesi kelimesine (literal) motomot çeviri yalnızca "meanings" dizisi içinde ikinci veya üçüncü sırada "Harfi harfine motomot anlamı: ..." şeklinde bilgilendirme amacıyla yer alabilir.
     d) Deyimler için "partOfSpeech" değeri MUTLAKA "idiom" veya "expression" olmalıdır.
2. Yalnızca geçerli bir JSON objesi döndür, markdown işaretleri (\`\`\`json vb.) veya açıklama KULLANMA.
3. Uydurma bilgi verme. Emin olmadığın etimolojiyi "certainty": "unknown" olarak işaretle.
4. Kelimenin veya deyimin kullanım bağlamına çok dikkat et. En yaygın anlamları (very_common / common) en üstte ver.
5. Örnek cümlelerin tamamen doğal ve günlük Felemenkçe/Türkçe konuşmaya uygun olmasına özen göster. Deyimlerde örnek cümle deyimin gerçek mecazi kullanımını yansıtmalıdır.
6. JSON yapısı şu şemaya KESİNLİKLE uymalıdır:

{
  "input": "kullanıcının girdiği ifade",
  "sourceLanguage": "nl veya tr",
  "targetLanguage": "nl veya tr",
  "pronunciation": {
    "ipa": "/.../",
    "simplified": "..."
  },
  "partOfSpeech": "noun, verb, adjective, adverb, idiom, expression, sentence vb.",
  "translations": [
    {
      "text": "ana çeviri (deyim ise mecazi asıl karşılığı)",
      "context": "bağlam (örn: deyim / mecaz)",
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
    "article": "de / het (Hollandaca tekil isimler için)",
    "plural": "çoğul hali",
    "infinitive": "mastar",
    "register": "informal / formal / slang / idiomatic vb.",
    "notes": ["ekstra gramer veya deyim notları"]
  },
  "etymology": {
    "summary": "kelime veya deyim kökeni / hikayesi özeti",
    "certainty": "high | medium | low | unknown"
  },
  "examples": [
    {
      "source": "kaynak dilde doğal örnek cümle",
      "translation": "hedef dilde çevirisi"
    }
  ],
  "relatedWords": [
    {
      "word": "ilişkili kelime veya eşanlamlı deyim",
      "relation": "synonym | antonym | related"
    }
  ]
}`;

  const LOCAL_SYSTEM_PROMPT = `Sen Felemenkçe ve Türkçe dillerinde uzman, hızlı bir mobil sözlük asistanısın.
Sana verilen kelime veya cümleyi analiz et ve YALNIZCA geçerli bir JSON objesi olarak döndür. Markdown (\`\`\`json) veya açıklama KULLANMA.
ÖNEMLİ KURALLAR:
1. Mobil işlemci hızını korumak için KISA, ÖZ ve NET ol.
2. DEYİM KURALI: Girdi bir deyim veya kalıplaşmış ifade ise (idiom/expression), KELİMESİ KELİMESİNE MOTOMOT ÇEVİRME! Ana çeviriye (translations[0]) DOĞRUDAN hedef dildeki mecazi deyimsel karşılığını yaz (Örn: "de kat uit de boom kijken" -> "durumu uzaktan izlemek / bekleyip görmek"). partOfSpeech: "idiom" veya "expression" yap.
3. En fazla 1-2 temel çeviri ve 1 doğal örnek cümle ver.

JSON Şablonu:
{
  "input": "girdi",
  "sourceLanguage": "nl veya tr",
  "targetLanguage": "nl veya tr",
  "partOfSpeech": "noun, verb, adjective, adverb, idiom, expression vb.",
  "translations": [
    { "text": "ana çeviri (deyim ise mecazi anlam)", "context": "kullanım", "frequency": "very_common" }
  ],
  "meanings": [
    { "meaning": "temel anlam", "explanation": "kısa açıklama" }
  ],
  "grammar": {
    "article": "de / het (Felemenkçe ise)",
    "plural": "çoğul",
    "infinitive": "mastar"
  },
  "examples": [
    { "source": "örnek cümle", "translation": "çevirisi" }
  ]
};`;

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
    const cleanBase = (baseUrl || getLocalLLMBaseUrl()).replace(/\/+$/, "");
    const rootBase = cleanBase.replace(/\/v1$/, "");

    // 1. Try native Ollama endpoint /api/tags (with 2500ms timeout)
    try {
      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 2500);
      const resp = await fetch(`${rootBase}/api/tags`, { method: "GET", signal: ctrl.signal });
      clearTimeout(tId);
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

    // 2. Try OpenAI-compatible /v1/models (with 2500ms timeout)
    try {
      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 2500);
      const resp = await fetch(`${cleanBase}/models`, { method: "GET", signal: ctrl.signal });
      clearTimeout(tId);
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

  // Determine optimal base URL for local LLM
  function getLocalLLMBaseUrl() {
    const isLocalServer = typeof window !== "undefined" && window.location.hostname === "127.0.0.1" && window.location.port === "8080";
    const custom = localStorage.getItem("local_llm_url");

    if (isLocalServer) {
      if (!custom || custom.includes("11434") || custom.includes("localhost")) {
        return window.location.origin + "/ollama/v1";
      }
    }

    if (custom && custom.trim()) {
      let clean = custom.trim().replace(/\/+$/, "");
      if (clean.includes("localhost")) {
        clean = clean.replace("localhost", "127.0.0.1");
      }
      return clean;
    }

    return "http://127.0.0.1:11434/v1";
  }

  // Helper to load settings (Defaults to Google Gemini for both phone and desktop)
  function getSettings() {
    const isMobile = isMobileDevice();

    // One-time migration: ensure devices previously defaulted to 'local' transition to Google Gemini
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem("lexi_default_provider_v2") !== "true") {
        if (localStorage.getItem("lexi_provider") === "local") {
          localStorage.removeItem("lexi_provider");
          localStorage.removeItem("lexi_provider_user_chosen");
        }
        localStorage.setItem("lexi_default_provider_v2", "true");
      }
    } catch (e) {}

    const defaultProvider = "google";
    const userChosen = localStorage.getItem("lexi_provider_user_chosen") === "true";
    const savedProvider = localStorage.getItem("lexi_provider");
    const activeProvider = (userChosen && savedProvider) ? savedProvider : defaultProvider;

    let savedModel = localStorage.getItem("lexi_model");
    if (!savedModel || savedModel.includes("latest") || savedModel.includes("pro") || savedModel.includes("3.8") || savedModel.includes("3.6") || savedModel.includes("2.5") || (activeProvider === "google" && (savedModel.includes("llama") || savedModel.includes("qwen")))) {
      savedModel = activeProvider === "local"
        ? (localStorage.getItem("local_llm_model") || (isMobile ? "qwen2.5:1.5b" : PROVIDERS.local.default_model))
        : PROVIDERS.google.default_model;
      localStorage.setItem("lexi_model", savedModel);
    }
    let googleKey = localStorage.getItem("gemini_api_key");
    if (!googleKey) {
      googleKey = SM_STUDIO_KEYS.google;
      if (googleKey) localStorage.setItem("gemini_api_key", googleKey);
    }
    let savedLocalUrl = localStorage.getItem("local_llm_url");
    if (!savedLocalUrl || savedLocalUrl.includes("localhost")) {
      savedLocalUrl = getLocalLLMBaseUrl();
      localStorage.setItem("local_llm_url", savedLocalUrl);
    }
    return {
      isMobile,
      provider: activeProvider,
      model: savedModel,
      googleKey: googleKey || "",
      nvidiaKey: localStorage.getItem("nvidia_api_key") || SM_STUDIO_KEYS.nvidia,
      localUrl: savedLocalUrl,
      localModel: localStorage.getItem("local_llm_model") || (isMobile ? "qwen2.5:1.5b" : PROVIDERS.local.default_model)
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
  // Multi-tier Robust JSON cleaner, auto-repairer & heuristic parser
  function parseJSONResponse(rawText) {
    let clean = (rawText || "").trim();
    if (!clean) throw new Error("Yapay zeka modelinden boş yanıt alındı.");

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

    // Attempt 1: Direct standard JSON.parse
    try {
      return JSON.parse(clean);
    } catch (e1) {
      // Proceed to Tier 2 syntax auto-repair
    }

    // Attempt 2: Advanced JSON Syntax Auto-Repair
    try {
      let repaired = clean
        // Strip single-line comments // ... and multiline comments /* ... */
        .replace(/\/\/[^\n\r]*/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Fix trailing commas before } or ]
        .replace(/,\s*([}\]])/g, "$1")
        // Fix missing commas between properties: "val"\n"key": or }\n"key":
        .replace(/([}\]"\d])\s*\n\s*(")/g, "$1,\n$2")
        // Fix unquoted property keys: { word: "..." } -> { "word": "..." }
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

      return JSON.parse(repaired);
    } catch (e2) {
      // Proceed to Tier 3 heuristic field extraction
    }

    // Attempt 3: Heuristic Regex Field Extractor (Fault-Tolerant Fallback)
    try {
      const extracted = {
        input: (clean.match(/"input"\s*:\s*"([^"]+)"/i) || [])[1] || "",
        sourceLanguage: (clean.match(/"sourceLanguage"\s*:\s*"([^"]+)"/i) || [])[1] || "nl",
        targetLanguage: (clean.match(/"targetLanguage"\s*:\s*"([^"]+)"/i) || [])[1] || "tr",
        partOfSpeech: (clean.match(/"partOfSpeech"\s*:\s*"([^"]+)"/i) || [])[1] || "",
        pronunciation: {
          ipa: (clean.match(/"ipa"\s*:\s*"([^"]+)"/i) || [])[1] || ""
        },
        grammar: {
          article: (clean.match(/"article"\s*:\s*"([^"]+)"/i) || [])[1] || "",
          plural: (clean.match(/"plural"\s*:\s*"([^"]+)"/i) || [])[1] || "",
          infinitive: (clean.match(/"infinitive"\s*:\s*"([^"]+)"/i) || [])[1] || "",
          register: (clean.match(/"register"\s*:\s*"([^"]+)"/i) || [])[1] || ""
        },
        translations: [],
        meanings: [],
        examples: [],
        relatedWords: []
      };

      // Extract translations
      const transMatches = clean.matchAll(/"text"\s*:\s*"([^"]+)"(?:[^{}]*?"context"\s*:\s*"([^"]*)")?(?:[^{}]*?"frequency"\s*:\s*"([^"]*)")?/gi);
      for (const m of transMatches) {
        if (m[1]) {
          extracted.translations.push({
            text: m[1],
            context: m[2] || "",
            frequency: m[3] || "common"
          });
        }
      }

      // Extract meanings
      const meaningMatches = clean.matchAll(/"meaning"\s*:\s*"([^"]+)"(?:[^{}]*?"explanation"\s*:\s*"([^"]*)")?/gi);
      for (const m of meaningMatches) {
        if (m[1]) {
          extracted.meanings.push({
            meaning: m[1],
            explanation: m[2] || ""
          });
        }
      }

      // Extract examples
      const exampleMatches = clean.matchAll(/"source"\s*:\s*"([^"]+)"(?:[^{}]*?"translation"\s*:\s*"([^"]*)")?/gi);
      for (const m of exampleMatches) {
        if (m[1]) {
          extracted.examples.push({
            source: m[1],
            translation: m[2] || ""
          });
        }
      }

      if (extracted.translations.length > 0 || extracted.input) {
        return extracted;
      }
    } catch (e3) {
      // Extraction failed
    }

    throw new Error("Yapay zeka model çıktısı JSON olarak çözümlenemedi.");
  }

  // Prompt Sanitization & XML Boundary Isolation (SEC-02 Protection)
  function formatLinguisticUserPrompt(query, sourceLang, targetLang) {
    const sanitized = String(query || "")
      .trim()
      .slice(0, 500)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ""); // Strip non-printable control characters
    
    const isMultiWord = sanitized.includes(" ");
    let idiomNotice = "";
    if (isMultiWord) {
      idiomNotice = `\nKRİTİK UYARI: Girdi birden fazla kelimeden oluşmaktadır. Eğer bu ifade bir deyim (idiom), atasözü veya mecazi bir kalıp ise KELİMESİ KELİMESİNE (MOTOMOT / LİTERAL) ÇEVİRME! translations[0].text alanına KESİNLİKLE deyimin hedef dildeki gerçek mecazi karşılığını (dengini) yaz. partOfSpeech değerini "idiom" veya "expression" yap.`;
    }

    return `Lütfen aşağıdaki XML etiketi içindeki ifadeyi analiz et. Girdi dili: ${sourceLang.toUpperCase()}, Hedef dil: ${targetLang.toUpperCase()}.${idiomNotice}
<girdi_metni>
${sanitized}
</girdi_metni>
Önemli: Yalnızca yukarıda tanımlanan JSON şemasına uygun geçerli bir JSON döndür. Ek açıklama veya markdown ekleme.`;
  }

  // Runtime Schema Validation & Fallback Normalization (REL-01 Protection)
  function normalizeLinguisticResult(raw, fallbackQuery, sourceLang, targetLang, providerName) {
    if (!raw || typeof raw !== "object") {
      raw = {};
    }

    const sl = (raw.sourceLanguage || sourceLang || "nl").toLowerCase();
    const tl = (raw.targetLanguage || targetLang || (sl === "nl" ? "tr" : "nl")).toLowerCase();

    // 1. Translations array normalization
    let translations = [];
    if (Array.isArray(raw.translations)) {
      translations = raw.translations
        .filter((t) => t && (t.text || typeof t === "string"))
        .map((t) => {
          if (typeof t === "string") return { text: t.trim(), context: "", frequency: "common" };
          return {
            text: String(t.text || "").trim(),
            context: String(t.context || "").trim(),
            frequency: String(t.frequency || "common").toLowerCase().trim()
          };
        })
        .filter((t) => t.text.length > 0);
    } else if (typeof raw.translations === "string" && raw.translations.trim()) {
      translations = [{ text: raw.translations.trim(), context: "", frequency: "common" }];
    }

    if (translations.length === 0) {
      translations = [{ text: String(fallbackQuery || "").trim(), context: "", frequency: "common" }];
    }

    // 2. Meanings array normalization
    let meanings = [];
    if (Array.isArray(raw.meanings)) {
      meanings = raw.meanings
        .filter((m) => m && (m.meaning || typeof m === "string"))
        .map((m) => {
          if (typeof m === "string") return { meaning: m.trim(), explanation: "", context: "" };
          return {
            meaning: String(m.meaning || "").trim(),
            explanation: String(m.explanation || "").trim(),
            context: String(m.context || "").trim()
          };
        })
        .filter((m) => m.meaning.length > 0);
    }

    // 3. Grammar object normalization
    const grammar = (raw.grammar && typeof raw.grammar === "object") ? {
      article: raw.grammar.article ? String(raw.grammar.article).trim() : "",
      plural: raw.grammar.plural ? String(raw.grammar.plural).trim() : "",
      infinitive: raw.grammar.infinitive ? String(raw.grammar.infinitive).trim() : "",
      register: raw.grammar.register ? String(raw.grammar.register).trim() : "",
      notes: Array.isArray(raw.grammar.notes) ? raw.grammar.notes.map(String) : []
    } : { article: "", plural: "", infinitive: "", register: "", notes: [] };

    // 4. Pronunciation normalization
    const pronunciation = (raw.pronunciation && typeof raw.pronunciation === "object") ? {
      ipa: raw.pronunciation.ipa ? String(raw.pronunciation.ipa).trim() : "",
      simplified: raw.pronunciation.simplified ? String(raw.pronunciation.simplified).trim() : ""
    } : { ipa: "", simplified: "" };

    // 5. Etymology normalization
    const etymology = (raw.etymology && typeof raw.etymology === "object") ? {
      summary: raw.etymology.summary ? String(raw.etymology.summary).trim() : "",
      certainty: raw.etymology.certainty ? String(raw.etymology.certainty).trim() : "unknown"
    } : { summary: "", certainty: "unknown" };

    // 6. Examples normalization
    let examples = [];
    if (Array.isArray(raw.examples)) {
      examples = raw.examples
        .filter((e) => e && (e.source || e.translation))
        .map((e) => ({
          source: String(e.source || "").trim(),
          translation: String(e.translation || "").trim()
        }))
        .filter((e) => e.source.length > 0);
    }

    // 7. Related words normalization
    let relatedWords = [];
    if (Array.isArray(raw.relatedWords)) {
      relatedWords = raw.relatedWords
        .filter((r) => r && (r.word || typeof r === "string"))
        .map((r) => {
          if (typeof r === "string") return { word: r.trim(), relation: "related" };
          return {
            word: String(r.word || "").trim(),
            relation: String(r.relation || "related").toLowerCase().trim()
          };
        })
        .filter((r) => r.word.length > 0);
    }

    return {
      input: String(raw.input || fallbackQuery || "").trim(),
      sourceLanguage: sl,
      targetLanguage: tl,
      partOfSpeech: String(raw.partOfSpeech || "").trim(),
      pronunciation: pronunciation,
      translations: translations,
      meanings: meanings,
      grammar: grammar,
      etymology: etymology,
      examples: examples,
      relatedWords: relatedWords,
      didYouMean: raw.didYouMean || "",
      _provider: providerName || raw._provider || "LexiBridge Dil Motoru",
      _latency: raw._latency || 0,
      _fallbackFrom: raw._fallbackFrom || undefined,
      _localError: raw._localError || undefined,
      _isQuickRest: !!raw._isQuickRest
    };
  }

  // Quick Google Translate REST call (0 API key enriched engine)
  async function quickTranslateRest(query, sourceLang, targetLang) {
    const sl = sourceLang === "nl" ? "nl" : "tr";
    const tl = targetLang === "nl" ? "nl" : "tr";
    const encoded = encodeURIComponent(query);

    // Request rich metadata: translation (t), alternatives (at), bilingual dict (bd),
    // romanization (rm), spell-check (qc), examples (ex), definitions (md), synsets (ss)
    const primaryUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&hl=tr&dt=t&dt=at&dt=bd&dt=rm&dt=qc&dt=ex&dt=md&dt=ss&dt=rw&q=${encoded}`;

    const isSingleWord = !query.trim().includes(" ");

    // 1. Primary Request
    const primaryPromise = fetch(primaryUrl).then((r) => {
      if (!r.ok) throw new Error(`REST Çeviri hatası: ${r.status}`);
      return r.json();
    });

    // 2. Parallel Secondary POS lookup (for single words to cleanly map noun/verb/adjective/adverb)
    let posPromise = Promise.resolve(null);
    if (isSingleWord) {
      const posUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=en&hl=en&dt=bd&q=${encoded}`;
      posPromise = fetch(posUrl)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    }

    const [data, posData] = await Promise.all([primaryPromise, posPromise]);

    // 1. Primary Translation & Transliteration
    let translated = "";
    let transliteration = "";
    if (data && Array.isArray(data[0])) {
      translated = data[0]
        .map((item) => (item && item[0] ? item[0] : ""))
        .filter(Boolean)
        .join("")
        .trim();
      const lastItem = data[0][data[0].length - 1];
      if (Array.isArray(lastItem) && typeof lastItem[3] === "string") {
        transliteration = lastItem[3];
      }
    }
    if (!translated) translated = query;

    // 2. Alternative Translations (Index 5)
    const alternativeList = [];
    if (data && Array.isArray(data[5])) {
      for (const entry of data[5]) {
        if (Array.isArray(entry) && Array.isArray(entry[2])) {
          for (const sub of entry[2]) {
            if (Array.isArray(sub) && sub[0] && typeof sub[0] === "string") {
              const altText = sub[0].trim();
              if (
                altText &&
                !alternativeList.includes(altText) &&
                altText.toLowerCase() !== translated.toLowerCase()
              ) {
                alternativeList.push(altText);
              }
            }
          }
        }
      }
    }

    // 3. Plural & Inflected Forms (Index 14)
    let pluralForm = "";
    if (data && Array.isArray(data[14])) {
      for (const formEntry of data[14]) {
        if (Array.isArray(formEntry) && formEntry[0] && typeof formEntry[0] === "string") {
          pluralForm = formEntry[0].trim();
          break;
        }
      }
    }

    // 4. "Did You Mean?" Spell Correction (Index 7)
    let didYouMean = "";
    if (data && Array.isArray(data[7]) && data[7][1]) {
      const candidate = String(data[7][1]).replace(/<[^>]*>/g, "").trim();
      if (candidate && candidate.toLowerCase() !== query.toLowerCase()) {
        didYouMean = candidate;
      }
    }

    // 5. Part of Speech (POS) Detection
    const POS_MAP = {
      noun: "İsim",
      verb: "Fiil",
      adjective: "Sıfat",
      adverb: "Zarf",
      pronoun: "Zamir",
      preposition: "Edat",
      conjunction: "Bağlaç",
      interjection: "Ünlem"
    };
    let detectedPos = "";
    const extraSynonyms = [];

    // Check posData from parallel lookup
    if (posData && Array.isArray(posData[1])) {
      for (const pGroup of posData[1]) {
        const pTag = pGroup[0];
        if (!detectedPos && pTag && POS_MAP[pTag]) {
          detectedPos = POS_MAP[pTag];
        }
        if (Array.isArray(pGroup[1])) {
          for (const word of pGroup[1]) {
            if (typeof word === "string" && !extraSynonyms.includes(word)) {
              extraSynonyms.push(word);
            }
          }
        }
      }
    }

    // Fallback POS check from direct dict (Index 1)
    if (!detectedPos && data && Array.isArray(data[1])) {
      for (const pGroup of data[1]) {
        const pTag = pGroup[0];
        if (pTag) {
          detectedPos = POS_MAP[pTag] || pTag.charAt(0).toUpperCase() + pTag.slice(1);
          break;
        }
      }
    }

    if (!detectedPos) {
      detectedPos = isSingleWord ? "kelime" : "cümle / ifade";
    }

    // 6. Build Consolidated Translations Array
    const translations = [
      { text: translated, frequency: "very_common" }
    ];
    const seen = new Set([translated.toLowerCase()]);
    for (const alt of alternativeList) {
      const lower = alt.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        translations.push({
          text: alt,
          frequency: "common"
        });
      }
      if (translations.length >= 8) break;
    }

    // 7. Structured Meanings List
    const meanings = translations.slice(0, 4).map((t, idx) => ({
      meaning: t.text,
      explanation: idx === 0 ? "Temel ve en yaygın karşılık" : "Alternatif kullanım / eşanlam",
      context: detectedPos
    }));

    // 8. Grammar info
    const grammar = {};
    if (pluralForm) {
      grammar.plural = pluralForm;
    }
    if (detectedPos === "Fiil") {
      grammar.infinitive = (sl === "nl" ? query : translated);
    }

    return {
      input: query,
      sourceLanguage: sl,
      targetLanguage: tl,
      pronunciation: {
        ipa: transliteration || "",
        simplified: ""
      },
      partOfSpeech: detectedPos,
      translations: translations,
      meanings: meanings,
      grammar: grammar,
      examples: [],
      relatedWords: translations.slice(1, 6).map((t) => t.text),
      didYouMean: didYouMean,
      _isQuickRest: true,
      _provider: "Hızlı REST (Zenginleştirilmiş Sözlük)"
    };
  }

  // Google Gemini API call (Optimized for Sub-Second Latency)
  async function callGoogleGemini(query, sourceLang, model, apiKey) {
    if (!apiKey) {
      throw new Error("Google Gemini API anahtarı girilmedi. Lütfen Ayarlar (⚙️) menüsünden API anahtarınızı girin veya ücretsiz 'Hızlı REST' modunu kullanın.");
    }
    const targetLang = sourceLang === "nl" ? "tr" : "nl";
    const userPrompt = formatLinguisticUserPrompt(query, sourceLang, targetLang);
    
    let activeModel = model;
    if (!activeModel || activeModel.includes("latest") || activeModel.includes("pro") || activeModel.includes("3.8") || activeModel.includes("3.6") || activeModel.includes("2.5")) {
      activeModel = "gemini-3.5-flash-lite";
    }

    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
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
    return normalizeLinguisticResult(parsed, query, sourceLang, targetLang, "Google Gemini (" + activeModel + ")");
  }

  // NVIDIA NIM API call (OpenAI compatible)
  async function callNvidiaNIM(query, sourceLang, model, apiKey) {
    if (!apiKey) throw new Error("NVIDIA NIM API anahtarı girilmedi. Lütfen Ayarlar (⚙️) menüsünden API anahtarınızı girin.");
    const targetLang = sourceLang === "nl" ? "tr" : "nl";
    const userPrompt = formatLinguisticUserPrompt(query, sourceLang, targetLang);
    
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
    return normalizeLinguisticResult(parsed, query, sourceLang, targetLang, "NVIDIA NIM (" + activeModel.split("/").pop() + ")");
  }

  // Yerel LLM (Ollama / Termux / Localhost)
  async function callLocalLLM(query, sourceLang, model, baseUrl) {
    const targetLang = sourceLang === "nl" ? "tr" : "nl";
    const userPrompt = formatLinguisticUserPrompt(query, sourceLang, targetLang);
    
    let cleanBase = (baseUrl || getLocalLLMBaseUrl()).trim().replace(/\/+$/, "");
    if (!cleanBase.endsWith("/v1")) {
      cleanBase = cleanBase + "/v1";
    }

    let activeModel = model || localStorage.getItem("local_llm_model") || (isMobileDevice() ? "qwen2.5:1.5b" : PROVIDERS.local.default_model);

    // 1. Hızlı erişim ve model doğrulama kontrolü (2.5 saniye timeout)
    async function probeServer(base) {
      const root = base.replace(/\/v1$/, "");
      const ctrl = new AbortController();
      const tId = setTimeout(() => ctrl.abort(), 2500);
      try {
        const r = await fetch(`${root}/api/tags`, { method: "GET", signal: ctrl.signal });
        clearTimeout(tId);
        if (r.ok) {
          const d = await r.json().catch(() => ({}));
          return { ok: true, models: d.models || [] };
        }
      } catch (e) {
        clearTimeout(tId);
      }
      return { ok: false, models: [] };
    }

    let targetBase = cleanBase;
    let probe = await probeServer(cleanBase);

    // cleanBase başarısızsa localhost, 127.0.0.1 ve ters proxy alternatiflerini dene
    if (!probe.ok) {
      const candidates = [];
      if (cleanBase.includes("127.0.0.1:11434")) {
        candidates.push(cleanBase.replace("127.0.0.1:11434", "localhost:11434"));
      } else if (cleanBase.includes("localhost:11434")) {
        candidates.push(cleanBase.replace("localhost:11434", "127.0.0.1:11434"));
      }
      
      if (typeof window !== "undefined" && window.location.port === "8080") {
        candidates.push(window.location.origin + "/ollama/v1");
      } else {
        candidates.push("http://127.0.0.1:8080/ollama/v1");
      }

      for (const alt of candidates) {
        if (alt === cleanBase) continue;
        const probeAlt = await probeServer(alt);
        if (probeAlt.ok) {
          probe = probeAlt;
          targetBase = alt;
          break;
        }
      }
    }

    if (!probe.ok) {
      throw new Error(
        `Yerel Ollama servisine bağlanılamadı (${cleanBase}). Termux'ta 'ollama serve' veya 'bash termux_baslat.sh' çalıştırıldığından emin olun.`
      );
    }

    // Yüklü modeller varsa, istenen modeli doğrula ya da hafif modeli otomatik seç
    if (probe.models && probe.models.length > 0) {
      const modelNames = probe.models.map(m => m.name || m.model || "");
      const exists = modelNames.some(n => n === activeModel || n.startsWith(activeModel.split(":")[0]));
      if (!exists) {
        // Telefondaysa öncelikle hafif 1.5b veya 1b modelleri tercih et
        const lightModel = modelNames.find(n => n.includes("1.5b") || n.includes("1b"));
        activeModel = lightModel || modelNames[0];
        console.log(`'${activeModel}' modeli otomatik seçildi.`);
        localStorage.setItem("local_llm_model", activeModel);
      }
    }

    const isMobile = isMobileDevice();
    const systemPromptToUse = isMobile ? LOCAL_SYSTEM_PROMPT : SYSTEM_PROMPT;
    const maxTokensToUse = isMobile ? 512 : 2048;

    const payload = {
      model: activeModel,
      messages: [
        { role: "system", content: systemPromptToUse },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      stream: false,
      max_tokens: maxTokensToUse,
      options: {
        num_predict: maxTokensToUse,
        temperature: 0.1
      }
    };

    // 2. LLM Çıkarımı (Mobil CPU için 180 saniye / 3 dakika süre tanınır)
    const inferCtrl = new AbortController();
    const inferTimeoutId = setTimeout(() => inferCtrl.abort(), 180000);

    let resp;
    try {
      resp = await fetch(`${targetBase}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: inferCtrl.signal
      });
      clearTimeout(inferTimeoutId);
    } catch (inferErr) {
      clearTimeout(inferTimeoutId);
      if (inferErr.name === "AbortError") {
        throw new Error(`Yerel model (${activeModel}) 180 saniye içinde yanıt veremedi. Telefon işlemcisi için hafif 'qwen2.5:1.5b' veya 'llama3.2:1b' önerilir.`);
      }
      throw new Error(`Yerel LLM çıkarım hatası: ${inferErr.message}`);
    }

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      const errMsg = err?.error?.message || err?.error || `HTTP ${resp.status}`;
      throw new Error(`Yerel LLM Hatası (${resp.status}): ${errMsg}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Yerel modelden boş yanıt döndü.");

    const parsed = parseJSONResponse(content);
    return normalizeLinguisticResult(parsed, query, sourceLang, targetLang, "Yerel LLM (" + activeModel + ")");
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
        try {
          return await callNvidiaNIM(cleanQuery, sourceLang, settings.model, settings.nvidiaKey);
        } catch (nvidiaErr) {
          console.warn("NVIDIA NIM çağrısı başarısız oldu, Hızlı REST yedeğe geçiliyor:", nvidiaErr.message);
          const restResult = await quickTranslateRest(cleanQuery, sourceLang, targetLang);
          restResult._provider = "Hızlı REST (NVIDIA Yedeği)";
          restResult._fallbackFrom = "nvidia";
          restResult._localError = nvidiaErr.message;
          return restResult;
        }
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
        try {
          return await callGoogleGemini(cleanQuery, sourceLang, settings.model, settings.googleKey);
        } catch (googleErr) {
          console.warn("Google Gemini çağrısı başarısız oldu, Hızlı REST yedeğe geçiliyor:", googleErr.message);
          const restResult = await quickTranslateRest(cleanQuery, sourceLang, targetLang);
          restResult._provider = "Hızlı REST (Gemini Yedeği)";
          restResult._fallbackFrom = "google";
          restResult._localError = googleErr.message;
          return restResult;
        }
      }
    } catch (err) {
      console.warn("AI Sağlayıcı hatası:", err);
      try {
        const finalRest = await quickTranslateRest(cleanQuery, sourceLang, targetLang);
        finalRest._provider = "Hızlı REST (Yedek Çeviri)";
        finalRest._fallbackFrom = provider;
        finalRest._localError = err.message;
        return finalRest;
      } catch {
        throw err;
      }
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
    quickTranslateRest,
    formatLinguisticUserPrompt,
    normalizeLinguisticResult
  };
})();
