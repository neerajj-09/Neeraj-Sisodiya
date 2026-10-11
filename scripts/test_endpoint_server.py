"""Tiny mock endpoint used only to test the contact form's success/error paths.
POST /anything -> 200 JSON; POST /fail -> 500 JSON.
Sends CORS headers + handles OPTIONS preflight, like real form providers."""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Content-Type",
}


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        for k, v in CORS.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, b"")

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        body = json.dumps({"ok": True, "received": raw.decode("utf-8", "replace")}).encode()
        if self.path.startswith("/fail"):
            self._send(500, b'{"errors":[{"message":"mock failure"}]}')
        else:
            self._send(200, body)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8124), Handler).serve_forever()
