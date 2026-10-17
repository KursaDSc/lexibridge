// Gemini API Service
const GeminiService = (function() {
  
  const SYSTEM_PROMPT = `Sen Hollandaca ve Türkçe dillerine çok hakim, uzman bir dilbilimci ve çevirmensin. 
Sana verilen kelime, ifade veya cümleyi en doğru şekilde analiz etmeli ve istenen JSON formatında, yapılandırılmış olarak döndürmelisin.

ÖNEMLİ KURALLAR:
1. Yalnızca geçerli bir JSON objesi döndür, markdown işaretleri (\`\`\`json vb.) KULLANMA.
2. Uydurma bilgi verme. Emin olmadığın etimolojiyi veya telaffuzu ekleme.
3. Kelimenin kullanım bağlamına çok dikkat et. En yaygın anlamları önceliklendir.
4. Örnek cümlelerin tamamen doğal ve günlük kullanıma uygun olmasına özen göster.
5. JSON yapısı şu şemaya KESİNLİKLE uymalıdır:

{
  "input": "kullanıcının girdiği kelime",
  "sourceLanguage": "nl veya tr",
  "targetLanguage": "nl veya tr",
  "pronunciation": { "ipa": "/.../" },
  "partOfSpeech": "noun, verb, vb.",
  "translations": [
    { "text": "çeviri", "context": "bağlam", "frequency": "common" }
  ],
  "meanings": [
    { "meaning": "anlam açıklaması", "explanation": "detay" }
  ],
  "grammar": {
    "article": "de/het",
    "plural": "çoğul hali",
    "infinitive": "mastar",
    "register": "informal vb."
  },
  "etymology": { "summary": "köken", "certainty": "high" },
  "examples": [
    { "source": "kaynak dil cümle", "translation": "çevirisi" }
  ],
  "relatedWords": [
    { "word": "kelime", "relation": "synonym" }
  ]
}`;

  async function analyze(query, sourceLang, apiKey) {
    if (!apiKey) {
      throw new Error("Lütfen ayarlardan Gemini API Anahtarınızı girin.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const targetLang = sourceLang === "nl" ? "tr" : "nl";
    const userPrompt = `Lütfen şu girdiyi analiz et. Girdi dili: ${sourceLang.toUpperCase()}, Hedef dil: ${targetLang.toUpperCase()}. Girdi: "${query}"`;

    const payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API Hatası (${response.status})`);
      }

      const data = await response.json();
      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResult) throw new Error("API'den geçersiz yanıt döndü.");

      return JSON.parse(textResult);

    } catch (error) {
      console.error("Gemini Error:", error);
      if (error instanceof SyntaxError) {
         throw new Error("Model beklenmeyen bir veri formatı döndürdü.");
      }
      throw error;
    }
  }

  return { analyze };
})();
