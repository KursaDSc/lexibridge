# 🌉 LexiBridge | AI Çok Dilli Mobil Sözlük & Dil Analizörü

**LexiBridge**, Hollandaca ↔ Türkçe başta olmak üzere diller arası derin dilbilimsel analiz, deyim çözümlemesi ve akıllı çeviri sunan, modern web (PWA), Android ve yerel yapay zeka (Ollama) destekli bir uygulamadır.

---

## ✨ Temel Özellikler

- 📱 **Akıllı Cihaz Tespiti:**
  - **Android / Termux Telefonlar:** Varsayılan olarak yerel, internetsiz ve %100 gizli **Yerel LLM (Ollama)** motorunu kullanır.
  - **Bilgisayar (PC / Masaüstü):** Varsayılan olarak ultra hızlı **Google Gemini** (`gemini-3.5-flash-lite`) motorunu kullanır.
- 🏠 **Yerel LLM (Ollama) & Otomatik Model Algılama:**
  - Android telefonunuzda Termux altındaki Ollama'yı tek tıkla kullanır.
  - Cihazınızda yüklü olan Ollama modellerini otomatik olarak tarar ve seçtirir.
- ⚡ **Hızlı REST Çeviri (0 API Key):** Anında, API anahtarı gerektirmeyen hızlı yedek çeviri seçeneği.
- 🌐 **PWA & Android Desteği:** İster tarayıcıdan "Ana Ekrana Ekle" ile tam ekran PWA olarak, ister Android APK olarak kurulabilir.
- 🔊 **Sesli Telaffuz:** Felemenkçe ve Türkçe doğal sesli telaffuz desteği.

---

## 🚀 Çalıştırma Yöntemleri

### 1. Android Telefonda (Termux + Ollama)
Telefonunuzda Termux ve Ollama kuruluysa:
```bash
bash termux_baslat.sh
```
Bu betik Ollama'yı CORS desteğiyle (`OLLAMA_ORIGINS="*"`) başlatır, modellerinizi listeler ve uygulamayı telefon tarayıcınızda otomatik açar.
Ayrıntılı rehber için: [TERMUX_KULLANIM_KILAVUZU.md](TERMUX_KULLANIM_KILAVUZU.md)

### 2. Bilgisayarda (Yerel Sunucu)
Windows üzerinde `Mobil_Sunucu_Baslat.bat` dosyasını çift tıklayarak çalıştırabilirsiniz. Uygulama `http://localhost:8080` adresinde açılacaktır.

---

## 🔒 Güvenlik Notu
Tüm özel API anahtarları, yerel konfigürasyonlar ve kişisel cihaz bilgileri `.gitignore` ile korunmaktadır.
