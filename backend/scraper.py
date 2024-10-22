import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from datetime import datetime, timedelta
import pytz
from cachetools import TTLCache, cached
import logging
import time

logging.basicConfig(level=logging.INFO)

# Caché que expira después de 24 horas
cache = TTLCache(maxsize=100, ttl=86400)  # 86400 segundos = 24 horas

# Definir la lista de estados
STATES = [
    'tennessee', 'texas', 'maryland', 'ohio', 'georgia', 'new-jersey', 'south-carolina', 'michigan',
    'maine', 'new-hampshire', 'iowa', 'rhode-island', 'kentucky', 'indiana', 'florida',
    'pennsylvania', 'tennessee-2', 'texas-2', 'illinois', 'missouri', 'district-of-columbia',
    'massachusetts', 'arkansas', 'virginia', 'kansas', 'delaware', 'connecticut', 'new-york',
    'wisconsin', 'north-carolina', 'new-mexico', 'mississippi', 'colorado', 'oregon',
    'california', 'idaho'
]

sorteoHoras = {
    'tennessee': '10:28:00',
    'texas': '11:00:00',
    'maryland': '12:28:00',
    'ohio': '12:29:00',
    'georgia': '12:29:00',
    'michigan': '12:59:00',
    'new-jersey': '12:59:00',
    'south-carolina': '12:59:00',
    'maine': '13:10:00',
    'new-hampshire': '13:10:00',
    'indiana': '13:20:00',
    'iowa': '13:20:00',
    'kentucky': '13:20:00',
    'texas-2': '13:27:00',
    'tennessee-2': '13:28:00',
    'florida': '13:30:00',
    'rhode-island': '13:30:00',
    'pennsylvania': '13:35:00',
    'illinois': '13:40:00',
    'missouri': '13:45:00',
    'district-of-columbia': '13:50:00',
    'connecticut': '13:57:00',
    'delaware': '13:58:00',
    'arkansas': '13:59:00',
    'virginia': '13:59:00',
    'massachusetts': '14:00:00',
    'kansas': '14:10:00',
    'new-york': '14:30:00',
    'wisconsin': '14:30:00',
    'north-carolina': '15:00:00',
    'new-mexico': '15:00:00',
    'mississippi': '15:30:00',
    'colorado': '15:30:00',
    'california': '16:00:00',
    'oregon': '16:00:00',
    'idaho': '16:00:00'
}

def is_time_to_scrape(state):
    eastern = pytz.timezone('America/New_York')
    now = datetime.now(eastern)
    sorteo_hora_str = sorteoHoras.get(state)
    if not sorteo_hora_str:
        return False
    sorteo_hora = datetime.strptime(sorteo_hora_str, '%H:%M:%S').time()
    sorteo_datetime = eastern.localize(datetime.combine(now.date(), sorteo_hora))
    
    # Buscar desde 5 minutos antes hasta 30 minutos después del sorteo
    window_start = sorteo_datetime - timedelta(minutes=5)
    window_end = sorteo_datetime + timedelta(minutes=30)
    return window_start <= now <= window_end

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
    results = {}
    for state in STATES:
        if is_time_to_scrape(state):
            result = scrape_lottery(state)
            if result:
                results[state] = {
                    'Pick 3': {'numbers': result['Pick 3'], 'date': result['date']},
                    'Pick 4': {'numbers': result['Pick 4'], 'date': result['date']},
                    'status': 'found'
                }
            else:
                results[state] = {'status': 'not_available'}
        else:
            results[state] = {'status': 'not_time'}
    return results

# Función para probar el comportamiento
def test_scraping_time():
    eastern = pytz.timezone('US/Eastern')
    current_time = datetime.now(eastern)
    logging.info(f"Hora actual en Eastern Time: {current_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    for state in STATES:
        if is_time_to_scrape(state):
            logging.info(f"Es hora de hacer scraping para {state}")
        else:
            logging.info(f"No es hora de hacer scraping para {state}")

# Llama a esta función para probar
test_scraping_time()
