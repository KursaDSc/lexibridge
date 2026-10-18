@echo off
title LexiBridge Mobil Sunucu
echo ========================================================
echo   LexiBridge Akilli Sozluk - Mobil Baglanti Sunucusu
echo ========================================================
echo.
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notlike '169.254*' -and $_.IPAddress -notlike '127*' }).IPAddress | Select-Object -First 1"') do set LOCAL_IP=%%i
if "%LOCAL_IP%"=="" set LOCAL_IP=localhost

echo.
echo Telefonunuz veya diger cihazlar icin baglanti adresi:
echo.
echo   👉 http://%LOCAL_IP%:8080   (veya http://localhost:8080)
echo.
echo Telefonda tarayicidan acip "Ana Ekrana Ekle" diyerek
echo PWA mobil uygulama olarak kullanabilirsiniz!
echo.
echo Kapatmak icin bu pencereyi kapatabilirsiniz.
echo ========================================================
python -m http.server 8080 --bind 0.0.0.0
pause
