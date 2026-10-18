import os
import sys
from PIL import Image

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
RES_DIR = os.path.join(ROOT_DIR, "android", "app", "src", "main", "res")
ASSETS_DIR = os.path.join(ROOT_DIR, "android", "app", "src", "main", "assets")

MIPMAP_SIZES = {
    "mipmap-mdpi": (48, 48),
    "mipmap-hdpi": (72, 72),
    "mipmap-xhdpi": (96, 96),
    "mipmap-xxhdpi": (144, 144),
    "mipmap-xxxhdpi": (192, 192),
}

def generate_icons(source_image_path):
    if not os.path.exists(source_image_path):
        print(f"Error: Source image not found: {source_image_path}")
        sys.exit(1)

    print(f">>> Loading source icon from: {source_image_path}")
    img = Image.open(source_image_path).convert("RGBA")
    print(f"    Source dimensions: {img.size}")

    # 1. Root & Web/PWA icons
    # 512x512
    icon512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    p512 = os.path.join(ROOT_DIR, "icon-512.png")
    icon512.save(p512, format="PNG", optimize=True)
    print(f"  [OK] Saved {p512} (512x512)")

    # 192x192
    icon192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    p192 = os.path.join(ROOT_DIR, "icon-192.png")
    icon192.save(p192, format="PNG", optimize=True)
    print(f"  [OK] Saved {p192} (192x192)")

    # Multi-resolution .ico
    p_ico = os.path.join(ROOT_DIR, "app_icon.ico")
    icon512.save(p_ico, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"  [OK] Saved {p_ico} (multi-res ICO)")

    # 2. Android Mipmap launcher icons
    for folder, size in MIPMAP_SIZES.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        res_img = img.resize(size, Image.Resampling.LANCZOS)
        out_path = os.path.join(folder_path, "ic_launcher.png")
        res_img.save(out_path, format="PNG", optimize=True)
        print(f"  [OK] Saved {out_path} ({size[0]}x{size[1]})")

    # 3. Android Assets icons (sync)
    os.makedirs(ASSETS_DIR, exist_ok=True)
    icon512.save(os.path.join(ASSETS_DIR, "icon-512.png"), format="PNG", optimize=True)
    icon192.save(os.path.join(ASSETS_DIR, "icon-192.png"), format="PNG", optimize=True)
    icon512.save(os.path.join(ASSETS_DIR, "app_icon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print("  [OK] Synced icons to android assets")

    print("\n>>> All app icons generated and updated successfully!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        src = sys.argv[1]
    else:
        src = os.path.join(ROOT_DIR, "icon-master.png")
    generate_icons(src)
