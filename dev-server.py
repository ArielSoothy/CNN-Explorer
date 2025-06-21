#!/usr/bin/env python3
"""
Development server with better error handling and features
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging with better formatting
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    # Change to the project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    PORT = 8000
    
    # Try to find an available port
    for port in range(PORT, PORT + 10):
        try:
            with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
                print(f"🚀 CNN Explorer Development Server")
                print(f"📁 Serving directory: {project_dir}")
                print(f"🌐 Server running at: http://localhost:{port}")
                print(f"📄 Open: http://localhost:{port}/index-new.html")
                print(f"🛑 Press Ctrl+C to stop the server\n")
                
                try:
                    httpd.serve_forever()
                except KeyboardInterrupt:
                    print("\n🛑 Server stopped by user")
                    sys.exit(0)
                    
        except OSError:
            continue
    
    print(f"❌ Could not find an available port starting from {PORT}")
    sys.exit(1)

if __name__ == "__main__":
    main()
