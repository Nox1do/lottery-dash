# Configuración básica
bind = '0.0.0.0:10000'
workers = 2  # Reducido para evitar sobrecarga
worker_class = 'gevent'
threads = 4
worker_connections = 1000

# Timeouts
timeout = 60  # Reducido de 120 a 60
graceful_timeout = 60
keep_alive = 2

# Logging
loglevel = 'info'
accesslog = '-'
errorlog = '-'

# Configuración adicional
max_requests = 1000
max_requests_jitter = 50
