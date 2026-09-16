"""Loopback workstation TCP forwarder to one fixed internal service.

This is not the agency LAN/TLS gateway and provides no identity assertions.
The case service remains on Docker's internal-only network.
"""

import selectors
import socket
import socketserver
import threading

slots = threading.BoundedSemaphore(16)


class Handler(socketserver.BaseRequestHandler):
    def handle(self):
        if not slots.acquire(blocking=False):
            return
        try:
            with socket.create_connection(("app", 8080), timeout=5) as upstream:
                self.request.settimeout(30)
                upstream.settimeout(30)
                with selectors.DefaultSelector() as selector:
                    selector.register(self.request, selectors.EVENT_READ, upstream)
                    selector.register(upstream, selectors.EVENT_READ, self.request)
                    while True:
                        ready = selector.select(timeout=30)
                        if not ready:
                            break
                        for key, _ in ready:
                            data = key.fileobj.recv(65536)
                            if not data:
                                return
                            key.data.sendall(data)
        except (OSError, TimeoutError):
            pass  # Do not log request bytes, case text, cookies or headers.
        finally:
            slots.release()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True
    request_queue_size = 16


if __name__ == "__main__":
    with Server(("0.0.0.0", 8080), Handler) as server:
        server.serve_forever()
