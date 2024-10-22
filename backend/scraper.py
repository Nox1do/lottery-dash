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
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    sorteo_hora = datetime.strptime(sorteoHoras[state], '%H:%M:%S').time()
    sorteo_datetime = eastern.localize(datetime.combine(now.date(), sorteo_hora))
    
    # Buscar desde 5 minutos antes hasta 30 minutos después del sorteo
    return sorteo_datetime - timedelta(minutes=5) <= now <= sorteo_datetime + timedelta(minutes=30)

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
