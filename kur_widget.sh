#!/bin/bash
# ========================================================
#  LexiBridge Termux:Widget Tek Tıkla Kurulumu
# ========================================================
#  Bu betik Termux:Widget uygulaması için ana ekrana
#  tek tıkla açılıp kapanan kısayolu tanımlar.
# ========================================================

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHORTCUTS_DIR="$HOME/.shortcuts"
TASKS_DIR="$HOME/.shortcuts/tasks"

mkdir -p "$SHORTCUTS_DIR"
mkdir -p "$TASKS_DIR"

LAUNCHER="$TASKS_DIR/LexiBridge.sh"

cat << EOF > "$LAUNCHER"
#!/bin/bash
cd "$REPO_DIR"
bash termux_baslat.sh
EOF

chmod +x "$LAUNCHER"

# Standart shortcuts klasörüne de kopyala
cp "$LAUNCHER" "$SHORTCUTS_DIR/LexiBridge.sh"
chmod +x "$SHORTCUTS_DIR/LexiBridge.sh"

echo "========================================================"
echo " ✓ LexiBridge Termux:Widget Kısayolu Başarıyla Kuruldu!"
echo "========================================================"
echo ""
echo "📱 Android Ana Ekranına Eklemek İçin:"
echo " 1. Telefon ana ekranınızda boş bir alana basılı tutun."
echo " 2. 'Widget'lar' (Araç Takımları) menüsüne girin."
echo " 3. 'Termux:Widget' simgesini bulun ve ana ekranınıza sürükleyin."
echo " 4. Listeden 'LexiBridge' seçeneğine dokunun."
echo ""
echo "🎯 Artık tek dokunuşla Ollama + Sözlük açılacak;"
echo "   tarayıcı sekmesi kapatıldığında hepsi otomatik kapanacaktır!"
echo "========================================================"
