@echo off
title LexiBridge Mobil Sunucu
echo ========================================================
echo   LexiBridge Akilli Sozluk - Mobil Baglanti Sunucusu
echo ========================================================
echo.
echo Telefonunuz ayni Wi-Fi agina bagliyken su adresi acin:
echo.
echo   👉 http://192.168.1.13:8080
echo.
echo Telefonda tarayicidan acip "Ana Ekrana Ekle" diyerek
echo gercek bir mobil uygulama olarak kullanabilirsiniz!
echo.
echo Kapatmak icin bu pencereyi kapatabilirsiniz.
echo ========================================================
python -m http.server 8080 --bind 0.0.0.0
pause
