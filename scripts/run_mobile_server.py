import http.server
import socketserver
import socket
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        return s.getsockname()[0]
    except Exception:
        return '127.0.0.1'
    finally:
        s.close()

def find_available_port(candidate_ports):
    for port in candidate_ports:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(('0.0.0.0', port))
            s.close()
            return port
        except Exception:
            continue
    return 8085

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent aggressive browser caching during mobile testing/updates
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)

    preferred_ports = [8085, 8088, 8090, 8080, 8000]
    port = find_available_port(preferred_ports)
    local_ip = get_local_ip()

    print("=" * 60)
    print("  \U0001f309 LingoMate Akilli Sozluk - Mobil Baglanti Sunucusu")
    print("=" * 60)
    print(f"\n  \U0001f4f1 Telefonunuz icin guncel baglanti adresi:")
    print(f"\n     👉 http://{local_ip}:{port}")
    print(f"     👉 http://localhost:{port}\n")
    if port != 8080:
        print(f"  \U00002139\U0000fe0f  Not: 8080 portu baska uygulama tarafindan kullanildigindan")
        print(f"     sunucu otomatik olarak cakismasiz {port} portuna alindi.")
    print("  \U00002705  Mobil tarayicidan bu adrese girerek guncel arayuzu")
    print("     ve yeni 3D uygulama ikonunu aninda gorebilirsiniz.")
    print("\n  Durdurmak icin Ctrl+C tusuna basin.")
    print("=" * 60 + "\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', port), NoCacheHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nSunucu kapatildi.")

if __name__ == '__main__':
    main()
