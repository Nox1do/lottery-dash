import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from datetime import datetime, timedelta
import pytz
import sys
from cachetools import TTLCache
import logging
import threading

logging.basicConfig(level=logging.INFO)

# Crear un caché que expire después de 5 minutos
cache = TTLCache(maxsize=50, ttl=300)
cache_lock = threading.Lock()  # Añadimos un lock para operaciones thread-safe

def scrape_state_lottery(state):
    try:
        base_state = state.replace('-2', '')
        url = f"https://www.lotteryusa.com/{base_state}/"
        
        # Aumentar el timeout de la petición
        response = requests.get(
            url, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout=15  # 15 segundos de timeout
        )
        
        if response.status_code != 200:
            logging.warning(f"Estado {state}: Status code {response.status_code}")
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        results = {}
        
        def get_numbers_and_date(number_selector, date_selector, game):
            numbers = ''
            date = ''
            number_elements = soup.select(number_selector)
            date_element = soup.select_one(date_selector)
            
            if number_elements and date_element:
                numbers = ''.join([elem.text.strip() for elem in number_elements if elem.text.strip().isdigit()])
                date = date_element.get('datetime', '').strip()
                if not date:
                    date = date_element.text.strip()
                # No intentamos formatear la fecha aquí, la dejamos como está
                return numbers, date
            
            return None, None

        # Configuraciones específicas para cada estado
        state_configs = {
            'tennessee': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(5) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(5) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'district-of-columbia': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(8) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(8) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'kansas': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'oregon': {
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'california': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'rhode-island': {
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'colorado': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'north-carolina': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'mississippi': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'idaho': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'tennessee-2': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(3) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(3) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(7) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(7) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'texas-2': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(3) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(3) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(8) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(8) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'georgia': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(5) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(5) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'florida': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(7) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(7) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'pennsylvania': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(7) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(7) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'illinois': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'texas': {
                'Pick 3': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                },
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(7) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(7) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            },
            'massachusetts': {
                'Pick 4': {
                    'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                    'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
                }
            }
        }

        # Configuración por defecto para los estados no especificados
        default_config = {
            'Pick 3': {
                'numbers': 'tr.c-result-card:nth-child(1) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                'date': 'tr.c-result-card:nth-child(1) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
            },
            'Pick 4': {
                'numbers': 'tr.c-result-card:nth-child(4) > td:nth-child(2) > div:nth-child(1) > ul:nth-child(1) > li',
                'date': 'tr.c-result-card:nth-child(4) > th:nth-child(1) > div:nth-child(2) > time:nth-child(2)'
            }
        }

        # Usar la configuración específica del estado si existe, de lo contrario usar la configuración por defecto
        config = state_configs.get(state, default_config)

        eastern = pytz.timezone('US/Eastern')
        today = datetime.now(eastern).date()
        today_str = today.strftime('%Y-%m-%d')  # Formato YYYY-MM-DD

        for game, selectors in config.items():
            numbers, date_str = get_numbers_and_date(selectors['numbers'], selectors['date'], game)
            if numbers and date_str:
                if date_str.startswith(today_str):
                    results[game] = {
                        'numbers': numbers,
                        'date': date_str
                    }
        
        return {state: results} if results else None  # Solo devuelve resultados si hay alguno para hoy

    except requests.RequestException as e:
        logging.error(f"Error en la petición para {state}: {str(e)}")
        return None
    except Exception as e:
        logging.error(f"Error general procesando {state}: {str(e)}")
        return None

def scrape_all_lotteries():
    logging.info("Iniciando scrape_all_lotteries")
    
    # Intentar obtener del caché de manera thread-safe
    with cache_lock:
        cached_results = cache.get('lottery_results')
        if cached_results:
            logging.info("Retornando resultados del caché")
            return cached_results

    states = [
        'tennessee', 'texas', 'maryland', 'ohio', 'georgia', 'new-jersey', 
        'south-carolina', 'michigan', 'maine', 'new-hampshire', 'iowa', 
        'rhode-island', 'kentucky', 'indiana', 'florida', 'pennsylvania', 
        'tennessee-2', 'texas-2', 'illinois', 'missouri', 'district-of-columbia',
        'massachusetts', 'arkansas', 'virginia', 'kansas', 'delaware', 
        'connecticut', 'new-york', 'wisconsin', 'north-carolina', 'new-mexico', 
        'mississippi', 'colorado', 'oregon', 'california', 'idaho'
    ]
    
    all_results = {}
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_state = {
            executor.submit(scrape_state_lottery, state): state 
            for state in states
        }
        
        for future in as_completed(future_to_state):
            state = future_to_state[future]
            try:
                result = future.result(timeout=30)
                if result and isinstance(result, dict):
                    all_results.update(result)
                    logging.info(f"Scraping completado para {state}")
            except Exception as exc:
                logging.error(f"Error al procesar {state}: {exc}")

    if all_results:
        # Guardar en caché de manera thread-safe
        with cache_lock:
            cache['lottery_results'] = all_results
            logging.info(f"Resultados guardados en caché. Estados procesados: {len(all_results)}")
    
    return all_results

if __name__ == '__main__':
    results = scrape_all_lotteries()
    print(results)
