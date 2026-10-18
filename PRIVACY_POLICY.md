# Gizlilik Politikası / Privacy Policy — LexiBridge

**Son Güncelleme / Last Updated:** 18 Ekim 2026

## 1. Genel Bakış (Overview)
LexiBridge, Felemenkçe ve Türkçe dilleri arasında yapay zeka destekli dilbilimsel sözlük ve öğrenim asistanıdır. Gizliliğinize ve veri egemenliğinize saygı duyuyoruz. Bu politika, mobil ve web uygulamalarımızın verilerinizi nasıl işlediğini açıklar.

## 2. Toplanan Veriler (Data Collection)
- **Kişisel Veriler:** LexiBridge, ad, e-posta, telefon numarası, konum, IP adresi veya cihaz kimliği (IDFA / GAID) gibi hiçbir kişisel veriyi **toplamaz**, **saklamaz** veya **üçüncü şahıslara satmaz**.
- **Kullanıcı Hesabı:** Uygulama herhangi bir kayıt veya giriş gerektirmez.

## 3. Sorgular ve Yapay Zeka İşlemleri (AI Data Transmission)
- Kullanıcının arama kutusuna yazdığı sözcük veya ifadeler, yalnızca anlık dilbilimsel analiz (anlam, telaffuz, gramer, örnek cümleler) amacıyla seçilen yapay zeka sağlayıcısına (Google Gemini API veya NVIDIA NIM) iletilir.
- Kullanıcı "Yerel LLM (Ollama)" modunu seçtiğinde, tüm veri işleme kullanıcının kendi cihazında (veya yerel ağında) gerçekleşir; hiçbir veri internete çıkmaz.
- "Hızlı REST" modunda, Google Translate REST uç noktası salt-okunur çeviri yanıtı için kullanılır.

## 4. API Anahtarlarının Güvenliği (BYOK — Bring Your Own Key)
- Kullanıcıların Ayarlar panelinden girdiği API anahtarları (Google Gemini API Key veya NVIDIA Key), yalnızca cihazın yerel tarayıcı/WebView depolama alanında (`localStorage`) saklanır.
- API anahtarları hiçbir zaman LexiBridge geliştiricisine veya harici bir sunucuya iletilmez.

## 5. Çevrimdışı Önbellek ve Yerel Depolama (Offline Storage)
- Arama geçmişiniz ve sık aranan sözlük verileri, çevrimdışı kullanımınızı kolaylaştırmak için cihazınızın yerel `IndexedDB` ve `localStorage` belleğinde tutulur.
- Ayarlar menüsündeki "Önbelleği & Ayarları Sıfırla" butonu ile cihazınızdaki tüm yerel verileri dilediğiniz an tek dokunuşla tamamen silebilirsiniz.

## 6. Üçüncü Taraf Hizmetleri (Third-Party Services)
LexiBridge aşağıdaki servislerle etkileşime girebilir:
- **Google Cloud / Gemini API:** Yalnızca dilbilimsel sorgu yürütme için (Kullanıcının kendi anahtarı veya ücretsiz uç nokta).
- **Google TTS (Text-to-Speech):** Felemenkçe ve Türkçe doğru telaffuz sesleri için.

## 7. Yapay Zeka İçerik Bildirimi (AI Content Reporting)
Google Play ve App Store yapay zeka güvenlik standartları uyarınca, uygunsuz veya hatalı bulduğunuz tüm AI çıktılarını sonuç kartındaki "Yanıtı Bildir" butonunu kullanarak anında işaretleyebilirsiniz.

## 8. İletişim (Contact)
Gizlilik politikamızla ilgili soru ve geri bildirimleriniz için GitHub repomuz üzerinden iletişime geçebilirsiniz.
