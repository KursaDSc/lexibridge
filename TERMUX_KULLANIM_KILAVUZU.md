# 📱 LexiBridge Android Termux & Ollama Kullanım Kılavuzu

Bu rehber, **LexiBridge** akıllı sözlük uygulamasını Android telefonunuzda **Termux** ve **Ollama** ile tamamen yerel (cihaz içinde, internetsiz ve %100 gizli) olarak çalıştırmanızı sağlar.

---

## ⚡ 1. Tek Tıkla Android Widget (Önerilen)

Telefonunuzun ana ekranından **tek bir dokunuşla** Ollama ve sözlüğü açabilir; tarayıcı sekmesini kapattığınızda ise Ollama ve Termux'un arka planda pil/RAM tüketmemesi için **otomatik kapanmasını** sağlayabilirsiniz!

### Widget Kurulumu (Yalnızca 1 Seferlik):
1. Termux'ta proje klasöründe şu komutu çalıştırın:
   ```bash
   bash kur_widget.sh
   ```
2. Android ana ekranınızda boş bir alana basılı tutun ve **"Widget'lar"** (Araç Takımları) menüsüne girin.
3. **"Termux:Widget"** seçeneğini seçip ana ekranınıza yerleştirin.
4. Listeden **`LexiBridge`** kısayolunu seçin.

> 🎯 **Artık Hazır:** Ana ekrandaki LexiBridge widget'ına bastığınız an:
> - Ollama arka planda başlar.
> - LexiBridge açılır ve tarayıcınızda otomatik ekrana gelir.
> - **Tarayıcı sekmesini kapattığınız an:** Ollama ve Termux sunucusu arka planda kendiliğinden tamamen kapanır!

---

## 💻 2. Bilgisayar ve Mobil Varsayılanları

* **💻 Bilgisayarda (PC / Masaüstü):**
  * Varsayılan motor **Google Gemini** (`gemini-3.5-flash-lite`) olarak başlar.
  * İster GitHub Pages (`https://...`), ister yerel sunucu üzerinden açın, anında çalışır.

* **📱 Cep Telefonunda (Android / Termux):**
  * Varsayılan motor doğrudan telefonunuzdaki **Yerel LLM (Ollama)** motorudur.
  * Widget ile açıldığında `http://127.0.0.1:8080` üzerinden açılır; böylece tarayıcının karma içerik (mixed content) engeline takılmadan %100 yerel Ollama kullanılır.
  * Tarayıcı menüsünden "Ana Ekrana Ekle" diyerek tam ekran PWA olarak da kullanabilirsiniz.

---

## 🧠 3. Telefon İçin Önerilen Hafif Ollama Modelleri

Android telefonların RAM ve pil tasarrufu için küçük boyutlu modeller en yüksek performansı verir:

| Model | Boyut | RAM Tüketimi | Açıklama |
|---|---|---|---|
| **`llama3.2:1b`** | ~1.3 GB | ~1.5 GB | **En Hızlı & En Hafif (Önerilen)** |
| **`qwen2.5:1.5b`** | ~1.0 GB | ~1.3 GB | **Çok Dilli (Türkçe & Felemenkçe dengeli)** |
| **`llama3.2:3b`** | ~2.0 GB | ~2.5 GB | Daha yüksek ayrıntı ve zenginlik |

Modeli indirmek için Termux'ta çalıştırmanız yeterlidir:
```bash
ollama pull llama3.2:1b
```

Uygulama açıldığında Ayarlar menüsündeki **"Modelleri Algıla"** butonu yüklü modelleri otomatik olarak tanır.

---

## 🌐 4. GitHub Pages Kullanımı

* **Bilgisayarda:** GitHub Pages (`https://kursadsc.github.io/lexibridge/`) üzerinden doğrudan Google Gemini ile sorunsuz kullanabilirsiniz.
* **Mobilde:** GitHub Pages'i doğrudan açtığınızda Google Gemini hazır çalışır. Eğer GitHub Pages (HTTPS) üzerinden yerel Ollama'yı (HTTP) bağlamak isterseniz Chrome Android'de `chrome://flags/#unsafely-treat-insecure-origin-as-secure` ayarına `http://127.0.0.1:11434` ekleyebilirsiniz. *(Ancak en konforlu ve sekme kapanınca otomatik durduran yöntem yukarıdaki Widget ile çalıştırmaktır).*

---

## 🔒 5. Güvenlik ve Gizlilik Garantisi

* **Sıfır Bulut Bağımlılığı:** Termux Ollama analizleri tamamen cihazınızın işlemcisinde çalışır; kişisel veriler dışarıya aktarılmaz.
* **Depo Güvenliği:** API anahtarlarınız ve yerel yapılandırmalarınız `.gitignore` ile korunmaktadır ve GitHub'a asla gönderilmez.
