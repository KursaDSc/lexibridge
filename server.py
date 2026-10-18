#!/usr/bin/env python3
"""
LexiBridge Termux & Local Server with Reverse Proxy to Ollama
- Serves static files on port 8080
- Proxies /ollama/* requests to http://127.0.0.1:11434/*
- Full CORS & Private Network Access support for browser compatibility
- Clean shutdown handling
"""

import http.server
import socketserver
import threading
import time
import os
import signal
import sys
import subprocess
import urllib.request
import urllib.error
import json

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
    def proxy_to_ollama(self, method):
        # Strip /ollama prefix: e.g. /ollama/v1/chat/completions -> /v1/chat/completions
        rel_path = self.path[len("/ollama"):]
        target_url = f"http://127.0.0.1:11434{rel_path}"
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            headers = {}
            for h in ["Content-Type", "Accept", "Authorization"]:
                if h in self.headers:
                    headers[h] = self.headers[h]
            
            req = urllib.request.Request(target_url, data=body, headers=headers, method=method)
            # 120 seconds timeout for local model inference on mobile CPU
            with urllib.request.urlopen(req, timeout=120) as resp:
                resp_data = resp.read()
                self.send_response(resp.status)
                self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Private-Network", "true")
                self.send_header("Content-Length", str(len(resp_data)))
                self.end_headers()
                self.wfile.write(resp_data)
        except urllib.error.HTTPError as he:
            err_data = he.read()
            self.send_response(he.code)
            self.send_header("Content-Type", he.headers.get("Content-Type", "application/json"))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Content-Length", str(len(err_data)))
            self.end_headers()
            self.wfile.write(err_data)
        except Exception as e:
            err_json = json.dumps({"error": f"Ollama proxy baglanti hatasi: {str(e)}"}).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Content-Length", str(len(err_json)))
            self.end_headers()
            self.wfile.write(err_json)

    def do_OPTIONS(self):
        # Support CORS preflight + Private Network Access preflight
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/ollama/"):
            self.proxy_to_ollama("GET")
            return
        if self.path == "/api/heartbeat":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
            return
        super().do_GET()

    def do_POST(self):
        if self.path.startswith("/ollama/"):
            self.proxy_to_ollama("POST")
            return
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
        print(f"[OK] Ollama Yerel Proxy aktif: http://127.0.0.1:{port}/ollama/")
        print("[BILGI] Durdurmak icin Termux'ta CTRL + C tuslarina basabilirsiniz.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            perform_shutdown()

if __name__ == "__main__":
    main()
