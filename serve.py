#!/usr/bin/env python3
"""
Simple HTTP server to serve the CNN educational website locally.
Run this script and navigate to http://localhost:8000 to view the website.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

def serve_website(port=8000):
    """Start a local web server to serve the CNN website."""
    
    # Change to the directory containing the website files
    website_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(website_dir)
    
    # Create server
    handler = http.server.SimpleHTTPRequestHandler
    
    # Add CORS headers for local development
    class CORSRequestHandler(handler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
    
    try:
        with socketserver.TCPServer(("", port), CORSRequestHandler) as httpd:
            print(f"🚀 CNN Educational Website Server")
            print(f"📁 Serving files from: {website_dir}")
            print(f"🌐 Server running at: http://localhost:{port}")
            print(f"📖 Open http://localhost:{port} in your browser to view the website")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print("-" * 60)
            
            # Try to open the browser automatically
            try:
                webbrowser.open(f'http://localhost:{port}')
                print("🌍 Opening website in your default browser...")
            except:
                print("💡 Please manually open http://localhost:{port} in your browser")
            
            # Start serving
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Trying port {port + 1}...")
            serve_website(port + 1)
        else:
            print(f"❌ Error starting server: {e}")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Thanks for exploring CNNs!")
        sys.exit(0)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Serve the CNN educational website')
    parser.add_argument('--port', '-p', type=int, default=8000, 
                       help='Port to serve on (default: 8000)')
    
    args = parser.parse_args()
    serve_website(args.port)
