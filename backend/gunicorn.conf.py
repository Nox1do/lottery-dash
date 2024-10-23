# Configuración básica para servidor con recursos limitados
bind = '0.0.0.0:10000'
workers = 2  # 2 workers para manejar 3-5 conexiones
threads = 2  # 2 threads por worker
worker_timeout = 120  # 2 minutos de timeout

# Configuración de recursos
max_requests = 100  # Reiniciar workers después de 100 requests
max_requests_jitter = 10
worker_class = 'sync'  # Usar worker sync por ser más ligero en memoria

# Timeouts ajustados para servidor lento
timeout = 120
graceful_timeout = 120
keepalive = 5

# Logging
loglevel = 'info'
accesslog = '-'
errorlog = '-'

# Configuración de buffer
forwarded_allow_ips = '*'
