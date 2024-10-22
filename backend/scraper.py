import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from datetime import datetime, timedelta
import pytz
from cachetools import TTLCache, cached
import logging

logging.basicConfig(level=logging.INFO)

# Caché que expira después de 24 horas
cache = TTLCache(maxsize=100, ttl=86400)  # 86400 segundos = 24 horas

sorteoHoras = {
    'tennessee': '10:28:00',
    'texas': '11:00:00',
    # ... (resto de los horarios)
}

@cached(cache)
def scrape_state_lottery(state):
    # ... (código existente)

    eastern = pytz.timezone('US/Eastern')
    current_time = datetime.now(eastern)
    sorteo_time = datetime.strptime(sorteoHoras.get(state, '00:00:00'), '%H:%M:%S').time()
    sorteo_datetime = eastern.localize(datetime.combine(current_time.date(), sorteo_time))

    # Solo buscar resultados si estamos dentro de los 30 minutos posteriores a la hora del sorteo
    if current_time < sorteo_datetime or (current_time - sorteo_datetime) > timedelta(minutes=30):
        return {state: {'status': 'not_available'}}

    # ... (resto del código de scraping)

    return {state: results if results else {'status': 'not_found'}}

def scrape_all_lotteries():
    # ... (código existente)

    all_results = {}
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_state = {executor.submit(scrape_state_lottery, state): state for state in states}
        for future in as_completed(future_to_state, timeout=60):
            state = future_to_state[future]
            try:
                result = future.result(timeout=10)
                all_results.update(result)
            except TimeoutError:
                all_results[state] = {'status': 'timeout'}
            except Exception as exc:
                all_results[state] = {'status': 'error'}

    return all_results
