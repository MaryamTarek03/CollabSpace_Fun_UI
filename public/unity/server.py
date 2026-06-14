import http.server
import socketserver
import os

PORT = 8080

class GzipHandler(http.server.SimpleHTTPRequestHandler):

    def send_head(self):
        path = self.translate_path(self.path)

        if self.path.endswith('.js.gz'):
            return self.serve_gz(path, 'application/javascript')
        elif self.path.endswith('.wasm.gz'):
            return self.serve_gz(path, 'application/wasm')
        elif self.path.endswith('.data.gz'):
            return self.serve_gz(path, 'application/octet-stream')

        return super().send_head()

    def serve_gz(self, path, content_type):
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(fs.st_size))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        return f

with socketserver.TCPServer(("", PORT), GzipHandler) as httpd:
    httpd.allow_reuse_address = True
    print(f"✅ Server running at http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()