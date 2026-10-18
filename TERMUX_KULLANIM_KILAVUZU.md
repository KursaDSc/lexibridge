# 📱 LexiBridge Android Termux & Ollama Kullanım Kılavuzu

Bu rehber, **LexiBridge** akıllı sözlük uygulamasını Android telefonunuzda **Termux** ve **Ollama** ile tamamen yerel (cihaz içinde, internetsiz ve %100 gizli) olarak çalıştırmanızı sağlar.

---

## ⚡ 1. Hızlı Başlangıç (Tek Komutla)

Termux terminalinizi açın ve proje klasöründe şu komutu çalıştırın:

```bash
bash termux_baslat.sh
```

Bu betik:
1. Ollama'yı tarayıcı bağlantılarına izin verecek şekilde (`OLLAMA_ORIGINS="*"`) arka planda başlatır.
2. Ollama'da yüklü olan modellerinizi listeler.
3. Yerel web sunucusunu `http://127.0.0.1:8080` üzerinde başlatır.
4. Telefonunuzun varsayılan web tarayıcısını (Chrome, Brave vb.) otomatik olarak açar.

---

## 🧠 2. Telefon İçin Önerilen Hafif Ollama Modelleri

Android telefonların RAM ve pil verimliliği için küçük ölçekli (1B - 3B) modeller en iyi performansı verir. Termux içinde istediğiniz modeli indirebilirsiniz:

| Model | Boyut | RAM Tüketimi | Açıklama |
|---|---|---|---|
| **`llama3.2:1b`** | ~1.3 GB | ~1.5 GB | **En Hızlı & En Hafif (Önerilen)** |
| **`qwen2.5:1.5b`** | ~1.0 GB | ~1.3 GB | **Çok Dilli (Türkçe & Hollandaca çok iyi)** |
| **`llama3.2:3b`** | ~2.0 GB | ~2.5 GB | Daha yüksek ayrıntı ve zenginlik |
| **`qwen2.5:3b`** | ~2.2 GB | ~2.8 GB | Gelişmiş dilbilimsel analiz |

Modeli indirmek için Termux'ta çalıştırmanız yeterlidir:
```bash
ollama pull llama3.2:1b
```

---

## ⚙️ 3. Akıllı Cihaz Tespiti & Sağlayıcı Yönetimi

* **📱 Cep Telefonunda (Android / Termux):**
  * Uygulama cihazınızı otomatik olarak **Mobil** olarak algılar.
  * **"Derin AI"** arama modu doğrudan telefonunuzdaki **Yerel LLM (Ollama)** motoruna bağlanır.
  * Ayarlar penceresindeki **"Modelleri Algıla"** butonuyla telefonunuzda yüklü olan modeller tek tıkla otomatik taranır.

* **💻 Bilgisayarda (PC / Tarayıcı):**
  * Masaüstü tarayıcısında varsayılan olarak **Google Gemini** (ultra hızlı `gemini-3.5-flash-lite`) devreye girer.
  * İstediğiniz an Ayarlar menüsünden Google, NVIDIA NIM veya Yerel LLM arasında geçiş yapabilirsiniz.

---

## 📲 4. Tam Ekran Mobil Uygulama (PWA) Yapma

Uygulama `http://127.0.0.1:8080` adresinde tarayıcınızda açıldığında:
1. Tarayıcı menüsünü (üç nokta `⋮`) açın.
2. **"Ana Ekrana Ekle"** veya **"Uygulamayı Yükle"** seçeneğine dokunun.
3. Artık telefonunuzun ana ekranında tıpkı yerel bir Android uygulaması gibi tam ekran çalışır.

---

## 🔒 5. Güvenlik ve Gizlilik Garantisi

* **Sıfır Bulut Bağımlılığı:** Termux altındaki Ollama ile yapılan tüm kelime ve cümle analizleri tamamen telefonunuzun donanımı üzerinde işlenir; hiçbir veri dışarıya veya buluta aktarılmaz.
* **Depo Güvenliği:** API anahtarlarınız, yerel ağ bilgileriniz ve kişisel konfigürasyonlarınız `.gitignore` ile korunmaktadır ve GitHub'a asla gönderilmez.
