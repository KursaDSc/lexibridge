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

PORT=8080
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="127.0.0.1:11434"

echo "========================================================"
echo " 📱 LexiBridge Android Termux & Ollama Baslatici"
echo "========================================================"
echo ""

# 1. Ollama Kontrolü
if command -v ollama >/dev/null 2>&1; then
  if curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "✓ Ollama servisi zaten calisiyor (127.0.0.1:11434)."
  else
    echo "⏳ Ollama servisi arka planda baslatiliyor..."
    ollama serve >/dev/null 2>&1 &
    OLLAMA_PID=$!
    
    # 5 saniye hazir olmasini bekle
    for i in 1 2 3 4 5 6 7 8 9 10; do
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
    echo "   👉 ollama pull llama3.2:1b    (~1.3 GB - Hizli & Hafif)"
    echo "   👉 ollama pull qwen2.5:1.5b   (~1.0 GB - Cok Dilli)"
    echo ""
  else
    echo "✓ Yuklu Ollama Modelleri Algilandi:"
    for m in $MODELS; do
      echo "   • $m"
    done
    echo ""
  fi
else
  echo "⚠️  'ollama' komutu bulunamadi. Ollama telefonunuzda baska bir yolla calisiyorsa"
  echo "   127.0.0.1:11434 adresinden erisilebilir oldugundan emin olun."
  echo ""
fi

# 2. Web Sunucusu ve Tarayici
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 LexiBridge Mobil Sunucu baslatiliyor..."
echo "   Yerel Adres: http://127.0.0.1:$PORT"
echo ""
echo "📱 Tarayicinizda acildiginda 'Ana Ekrana Ekle' diyerek"
echo "   tam ekran mobil PWA seklinde de kullanabilirsiniz."
echo "💡 Tarayici sekmesini kapattiginizda Ollama ve sunucu otomatik sonlanacaktir."
echo "========================================================"

# Tarayıcıyı otomatik açma denemesi (Termux api veya intent)
(
  sleep 1.2
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

# Sunucuyu baslat (server.py: heartbeat ve sekme kapandığında otomatik kapatma)
if command -v python3 >/dev/null 2>&1; then
  python3 "$SCRIPT_DIR/server.py" $PORT
elif command -v python >/dev/null 2>&1; then
  python "$SCRIPT_DIR/server.py" $PORT
else
  echo "❌ Hata: Python bulunamadi."
  echo "   Termux'ta su komutla kurabilirsiniz: pkg install python"
  exit 1
fi

# Termux oturumunu kapat
exit 0
