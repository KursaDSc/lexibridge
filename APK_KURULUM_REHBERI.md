# 📱 LingoMate Android APK Derleme ve Yükleme Rehberi

Bu proje, **GitHub Actions** bulut derleme motoru ile otomatik olarak **Android APK** dosyası üretecek şekilde hazırlandı.

---

## 🚀 3 Adımda Kendi APK'nızı İndirin

### 1. Adım: GitHub'da Yeni Bir Boş Depo (Repository) Açın
1. [github.com](https://github.com) adresine gidin.
2. Sağ üstten **+ (New repository)** butonuna tıklayın.
3. İsim olarak **`lexibridge`** yazın.
4. Gizlilik olarak **Private** (Gizli) veya **Public** seçin ve **Create repository** butonuna basın.

---

### 2. Adım: Projeyi GitHub'a Yükleyin
Bu klasörde PowerShell veya Terminal açıp şu 3 satırı çalıştırın (kendi kullanıcı adınızı yazın):

```bash
git add .
git commit -m "feat: LingoMate Android APK ve mobil sozluk"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/lexibridge.git
git push -u origin main
```

---

### 3. Adım: APK Dosyasını Telefonunuza İndirin
1. GitHub reponuzda üst menüdeki **"Actions"** sekmesine tıklayın.
2. **"Build LingoMate Android APK"** işinin otomatik başladığını göreceksiniz (~1-2 dakika sürer).
3. Yeşil tik (Başarılı) olduğunda çalışan işe tıklayın.
4. En alttaki **Artifacts** bölümünde **`LingoMate-Android-APK`** dosyasını göreceksiniz.
5. İndirip telefonunuza gönderin ve üzerine dokunarak kurun!

---

## 🔒 Güvenlik Notu
API anahtarlarınız (`gemini_api_key`, `nvidia_api_key`) ve kişisel ayarlarınız **`.gitignore`** ile tamamen koruma altına alınmıştır; GitHub'a asla yüklenmez. Telefona kurduktan sonra uygulama içerisindeki Ayarlar simgesine dokunarak anahtarlarınızı güvenle girebilirsiniz.
