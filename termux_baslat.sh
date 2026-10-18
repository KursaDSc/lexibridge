#!/bin/bash
# ========================================================
#  LexiBridge Mobile (Termux + Ollama All-In-One Launcher)
# ========================================================
#  Bu betik Android Termux ortamında:
#  1. Ollama CORS (OLLAMA_ORIGINS="*") ayarlarını yapar.
#  2. Ollama arka plan servisini kontrol eder / başlatır.
#  3. Yüklü modelleri listeler (yoksa hafif model önerir).
#  4. LexiBridge Web Sunucusunu 127.0.0.1:8080 üzerinde başlatır.
#  5. Telefonun varsayılan tarayıcısında uygulamayı otomatik açar.
# ========================================================

set -e

# Android'in Termux'u uyutmasını engellemek için wake-lock al
if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock 2>/dev/null || true
fi

PORT=8080
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"

echo "========================================================"
echo " 📱 LexiBridge Android Termux & Ollama Baslatici"
echo "========================================================"
echo ""

# 1. Ollama Kontrolü ve CORS Doğrulaması
if command -v ollama >/dev/null 2>&1; then
  RESTART_OLLAMA=0
  if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    # CORS kontrolü yap (Origin header'ı ile test)
    CORS_OK=$(curl -s -I -X OPTIONS http://127.0.0.1:11434/api/tags -H "Origin: http://127.0.0.1:8080" 2>/dev/null | grep -i "access-control-allow-origin" || true)
    if [ -z "$CORS_OK" ]; then
      echo "⚠️  Ollama calisiyor ancak tarayici izni (CORS) eksik."
      echo "   Tarayici erisimi icin CORS ile yeniden baslatiliyor..."
      killall ollama 2>/dev/null || true
      sleep 1
      RESTART_OLLAMA=1
    else
      echo "✓ Ollama servisi CORS izniyle aktif (127.0.0.1:11434)."
    fi
  else
    RESTART_OLLAMA=1
  fi

  if [ "$RESTART_OLLAMA" -eq 1 ]; then
    echo "⏳ Ollama servisi tarayici izniyle arka planda baslatiliyor..."
    export OLLAMA_ORIGINS="*"
    export OLLAMA_HOST="0.0.0.0:11434"
    ollama serve >/dev/null 2>&1 &
    
    # 6 saniye hazir olmasini bekle
    for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
      if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
        echo "✓ Ollama servisi hazir."
        break
      fi
      sleep 0.5
    done
  fi

  # Yüklü modelleri kontrol et
  MODELS=$(curl -s http://127.0.0.1:11434/api/tags 2>/dev/null | grep -o '"name":"[^"]*' | cut -d'"' -f4 || true)
  if [ -z "$MODELS" ]; then
    echo ""
    echo "⚠️  Ollama'da henuz yuklu bir model bulunamadi!"
    echo "   Telefonunuz icin onerilen ultra hafif modeller:"
    echo "   👉 ollama pull qwen2.5:3b     (Kaliteli Türkçe & Flemenkçe)"
    echo "   👉 ollama pull llama3.2:1b    (~1.3 GB - Hizli & Hafif)"
    echo ""
  else
    echo "✓ Yuklu Ollama Modelleri Algilandi:"
    for m in $MODELS; do
      echo "   • $m"
    done
    echo ""
    # Hafif modeli telefon belleğine ön-yükle (Cold start gecikmesini sıfırlar)
    PREF_MODEL=$(echo "$MODELS" | grep -E "1\.5b|1b" | head -n1 || echo "$MODELS" | head -n1)
    if [ -n "$PREF_MODEL" ]; then
      echo "⚡ '$PREF_MODEL' modeli telefon RAM'ine ön-yükleniyor..."
      (curl -s http://127.0.0.1:11434/api/generate -d "{\"model\": \"$PREF_MODEL\", \"prompt\": \"hi\", \"stream\": false}" >/dev/null 2>&1 &)
    fi
  fi
else
  echo "⚠️  'ollama' komutu bulunamadi. Ollama telefonunuzda baska bir yolla calisiyorsa"
  echo "   127.0.0.1:11434 adresinden erisilebilir oldugundan emin olun."
  echo ""
fi

# 2. Web Sunucusu ve Tarayici
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Termux uyku kilidi (Android arka planda durdurmasın)
if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock 2>/dev/null || true
fi

# Sunucu zaten çalışıyor mu kontrol et
if curl -s http://127.0.0.1:$PORT/api/heartbeat >/dev/null 2>&1; then
  echo "✓ LexiBridge Web Sunucusu zaten calisiyor (http://127.0.0.1:$PORT)."
else
  echo "🚀 LexiBridge Mobil Sunucu arka planda baslatiliyor..."
  if command -v python3 >/dev/null 2>&1; then
    python3 "$SCRIPT_DIR/server.py" $PORT >/dev/null 2>&1 &
  elif command -v python >/dev/null 2>&1; then
    python "$SCRIPT_DIR/server.py" $PORT >/dev/null 2>&1 &
  else
    echo "❌ Hata: Python bulunamadi."
    echo "   Termux'ta su komutla kurabilirsiniz: pkg install python"
    exit 1
  fi
  sleep 0.8
  echo "✓ LexiBridge Web Sunucusu ve Ters Proxy aktif: http://127.0.0.1:$PORT"
fi

# Tarayıcıyı otomatik açma denemesi (Termux api veya intent)
(
  sleep 1.0
  if command -v termux-open-url >/dev/null 2>&1; then
    termux-open-url "http://127.0.0.1:$PORT"
  elif command -v termux-open >/dev/null 2>&1; then
    termux-open "http://127.0.0.1:$PORT"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://127.0.0.1:$PORT"
  elif command -v am >/dev/null 2>&1; then
    am start -a android.intent.action.VIEW -d "http://127.0.0.1:$PORT" >/dev/null 2>&1 || true
  fi
) &

echo ""
echo "🎉 HER SEY HAZIR & ARKA PLANDA AKTIF!"
echo "   📱 Tarayiciniz acilmistir: http://127.0.0.1:$PORT"
echo "   🤖 Yerel Model: qwen2.5:3b (Ollama)"
echo ""
echo "💡 Termux ekrani serbesttir; istediginiz gibi komut yazabilir"
echo "   veya Termux'u simge durumuna kucultebilirsiniz."
echo "🛑 Durdurmak istediginizde: killall ollama python3"
echo "========================================================"
