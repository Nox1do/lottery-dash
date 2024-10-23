from gevent import monkey
monkey.patch_all()

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from datetime import datetime, timedelta
import pytz
from cachetools import TTLCache
from constants import sorteoHoras, stateOrder
import time

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache aumentado a 10 minutos para reducir carga en el servidor
cache = TTLCache(maxsize=100, ttl=600)

def scrape_state_lottery(state, timeout=30):  # Aumentado a 30 segundos
    """
    Scrape individual para cada estado con timeout aumentado
    """
    try:
        logger.info(f"Iniciando scraping para {state}")
        time.sleep(1)  # Pequeña pausa para no sobrecargar el CPU
        # Tu código de scraping existente aquí
        return results
    except Exception as e:
        logger.error(f"Error scraping {state}: {e}")
        return None

def scrape_all_lotteries():
    """
    Función principal de scraping optimizada para recursos limitados
    """
    logger.info("Iniciando scrape_all_lotteries")
    eastern = pytz.timezone('US/Eastern')
    current_date = datetime.now(eastern).date()
    
    # Verificar caché primero
    cached_results = cache.get('lottery_results')
    if cached_results and cached_results.get('date') == current_date:
        logger.info("Retornando resultados en caché")
        return cached_results.get('results', {})

    all_results = {}
    failed_states = []

    # Reducir workers para conservar memoria
    with ThreadPoolExecutor(max_workers=2) as executor:
        # Filtrar estados basados en horario
        states_to_scrape = [
            state for state in stateOrder 
            if should_scrape_state(state)
        ]

        if not states_to_scrape:
            logger.info("No hay estados para scrapear en este momento")
            return all_results

        future_to_state = {
            executor.submit(scrape_state_lottery, state): state 
            for state in states_to_scrape
        }
        
        try:
            for future in as_completed(future_to_state, timeout=90):  # Aumentado a 90 segundos
                state = future_to_state[future]
                try:
                    result = future.result(timeout=30)  # Aumentado a 30 segundos
                    if result:
                        all_results.update(result)
                        logger.info(f"Resultados encontrados para {state}")
                    else:
                        failed_states.append(state)
                except TimeoutError:
                    logger.warning(f"Timeout para {state}")
                    failed_states.append(state)
                except Exception as e:
                    logger.error(f"Error procesando {state}: {e}")
                    failed_states.append(state)
                
                time.sleep(0.5)  # Pequeña pausa entre estados
        except Exception as e:
            logger.error(f"Error general en scraping: {e}")

    # Actualizar caché incluso con resultados parciales
    if all_results:
        cache['lottery_results'] = {
            'date': current_date,
            'results': all_results
        }
        logger.info(f"Cache actualizado con {len(all_results)} resultados")

    if failed_states:
        logger.warning(f"Estados fallidos: {', '.join(failed_states)}")

    return all_results

def should_scrape_state(state):
    """
    Determina si un estado debe ser scrapeado basado en su horario
    """
    try:
        eastern = pytz.timezone('US/Eastern')
        current_time = datetime.now(eastern)
        
        sorteo_time_str = sorteoHoras.get(state)
        if not sorteo_time_str:
            return False
            
        sorteo_time = datetime.strptime(sorteo_time_str, '%I:%M:%S %p').time()
        sorteo_datetime = datetime.combine(current_time.date(), sorteo_time)
        sorteo_datetime = eastern.localize(sorteo_datetime)
        
        time_since_sorteo = current_time - sorteo_datetime
        
        # Ventana de tiempo ampliada para servidor lento
        return timedelta(minutes=-5) <= time_since_sorteo <= timedelta(minutes=45)
        
    except Exception as e:
        logger.error(f"Error verificando horario para {state}: {e}")
        return False
