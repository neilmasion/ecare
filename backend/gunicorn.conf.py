# ==============================================================
# eCare Production Gunicorn Configuration (Load Balancing & Workers)
# ==============================================================
import multiprocessing

# Bind to localhost or unix socket
bind = "127.0.0.1:8000"

# Number of worker processes (2 * cores + 1)
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 4

# Worker lifecycle & memory leak prevention
max_requests = 1000
max_requests_jitter = 50
timeout = 30
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
