import http.server
import ssl
import socketserver

PORT = 8000
ADDRESS = "127.0.0.1"

Handler = http.server.SimpleHTTPRequestHandler

# Create an SSL context using a modern protocol
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

# Load your self-signed certificate and private key
try:
    context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
except FileNotFoundError:
    print("Error: 'key.pem' or 'cert.pem' not found.")
    print("Please generate the certificate and key files by running:")
    print("openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365")
    exit(1)

# Use a TCPServer that can be properly shut down
with socketserver.TCPServer((ADDRESS, PORT), Handler) as httpd:
    # Wrap the server's socket with the SSL context
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"Serving HTTPS on https://{ADDRESS}:{PORT}")
    httpd.serve_forever()