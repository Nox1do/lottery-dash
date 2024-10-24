import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
from datetime import datetime, timedelta
import pytz
import sys
from cachetools import TTLCache, cached
import logging

logging.basicConfig(level=logging.INFO)

# Crear un caché que expire después de 24 horas
cache = TTLCache(maxsize=50, ttl=300)  # 600 segundos = 10 minutos

def scrape_state_lottery(state):
    base_state = state.replace('-2', '')
    url = f"https://www.lotteryusa.com/{base_state}/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
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

@cached(cache)
def scrape_all_lotteries():
    logging.info("Iniciando scrape_all_lotteries")
    states = [
        'tennessee', 'texas', 'maryland', 'ohio', 'georgia', 'new-jersey', 'south-carolina', 'michigan',
        'maine', 'new-hampshire', 'iowa', 'rhode-island', 'kentucky', 'indiana', 'florida',
        'pennsylvania', 'tennessee-2', 'texas-2', 'illinois', 'missouri', 'district-of-columbia',
        'massachusetts', 'arkansas', 'virginia', 'kansas', 'delaware', 'connecticut', 'new-york',
        'wisconsin', 'north-carolina', 'new-mexico', 'mississippi', 'colorado', 'oregon',
        'california', 'idaho'
    ]
    
    all_results = {}
    
    eastern = pytz.timezone('US/Eastern')
    current_datetime = datetime.now(eastern)
    current_date = current_datetime.date()

    with ThreadPoolExecutor(max_workers=3) as executor:
        future_to_state = {executor.submit(scrape_state_lottery, state): state for state in states}
        for future in as_completed(future_to_state, timeout=120):
            state = future_to_state[future]
            try:
                result = future.result(timeout=20)
                if result and result[state]:
                    all_results.update(result)
                    logging.info(f"Scraping completado para {state}")
            except TimeoutError:
                logging.warning(f"Timeout al procesar el estado {state}")
            except Exception as exc:
                logging.error(f"Error al procesar el estado {state}: {exc}")

    logging.info("scrape_all_lotteries completado")
    return all_results

if __name__ == '__main__':
    results = scrape_all_lotteries()
    print(results)
