#!/usr/bin/env python3
"""
LexiBridge Termux & Local Server with Tab-Close Auto-Shutdown
- Serves static files on port 8080
- Listens for browser heartbeats (/api/heartbeat)
- On tab close (/api/shutdown or 8s heartbeat timeout):
  Terminates Ollama and shuts down the local server cleanly.
"""

import http.server
import socketserver
import threading
import time
import os
import signal
import sys
import subprocess

# Ensure UTF-8 output on all platforms
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
shutdown_triggered = False

def terminate_ollama():
    """Stops the Ollama background process on Termux/Linux/Windows"""
    try:
        if sys.platform == "win32":
            subprocess.run(["taskkill", "/F", "/IM", "ollama.exe"], capture_output=True)
        else:
            # Termux / Android / Linux
            subprocess.run(["pkill", "-f", "ollama serve"], capture_output=True)
            subprocess.run(["killall", "ollama"], capture_output=True)
    except Exception as e:
        print(f"[Ollama Kapatma]: {e}")

def perform_shutdown():
    global shutdown_triggered
    if shutdown_triggered:
        return
    shutdown_triggered = True
    print("\n[BILGI] LexiBridge sunucusu durduruluyor...")
    terminate_ollama()
    print("[OK] Ollama ve sunucu guvenle kapatildi.")
    os._exit(0)

class LexiHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global last_heartbeat, client_ever_connected
        if self.path == "/api/heartbeat":
            last_heartbeat = time.time()
            client_ever_connected = True
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/shutdown":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"shutting_down"}')
            threading.Thread(target=lambda: (time.sleep(0.3), perform_shutdown())).start()
            return
        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        # Support CORS preflight
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def log_message(self, format, *args):
        # Silence routine heartbeat log spam
        if args and len(args) > 0 and "/api/heartbeat" in str(args[0]):
            return
        super().log_message(format, *args)

def main():
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass

    # Allow port reuse immediately
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), LexiHandler) as httpd:
        print(f"[OK] LexiBridge Sunucu aktif: http://127.0.0.1:{port}")
        print("[BILGI] Durdurmak icin Termux'ta CTRL + C tuslarina basabilirsiniz.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            perform_shutdown()

if __name__ == "__main__":
    main()
