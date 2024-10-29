from flask import Flask, jsonify
from flask_cors import CORS
from scraper import scrape_all_lotteries, cache
from datetime import datetime
import pytz
import os
import logging
from threading import Lock
from concurrent.futures import TimeoutError
import time

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://lottery-dash.vercel.app", "http://localhost:3000"],
        "methods": ["GET"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear un lock para el caché
cache_lock = Lock()

@app.route('/')
def home():
    logger.info("Ruta home accedida")
    return jsonify({"message": "Bienvenido a la API de Lottery Dashboard"}), 200

@app.route('/api/lottery-results')
def get_lottery_results():
    try:
        with cache_lock:
            cached_results = cache.get('lottery_results')
            if cached_results:
                logger.info("Usando resultados en caché")
                return jsonify(cached_results)

            start_time = time.time()
            results = scrape_all_lotteries()
            
            # Reducir el timeout total a 30 segundos
            if time.time() - start_time > 30:
                logger.warning("Timeout en scraping")
                raise TimeoutError("Scraping tomó demasiado tiempo")

            if not results:
                return jsonify({
                    "error": "No se pudieron obtener resultados",
                    "date": datetime.now(pytz.timezone('US/Eastern')).isoformat(),
                    "results": {},
                    "states_checked": [],
                    "states_with_results": []
                }), 404

            # Procesar resultados exitosos
            eastern = pytz.timezone('US/Eastern')
            current_time = datetime.now(eastern)

            # Mejorar el procesamiento de fechas con mejor manejo de errores
            for state, state_results in results.items():
                for lottery, lottery_result in state_results.items():
                    if 'date' in lottery_result:
                        try:
                            date_str = lottery_result['date']
                            date_obj = parse_date_with_fallback(date_str, current_time, eastern)
                            lottery_result['date'] = date_obj.isoformat()
                        except Exception as e:
                            logger.error(f"Error procesando fecha para {state}-{lottery}: {e}")
                            lottery_result['date'] = current_time.isoformat()

            # Construir respuesta
            response = build_response(results, current_time)
            cache['lottery_results'] = response
            logger.info("Resultados de la lotería procesados exitosamente")
            return jsonify(response)

    except Exception as e:
        logger.exception("Error procesando resultados")
        return jsonify({
            "error": "Error interno del servidor",
            "message": str(e),
            "date": datetime.now(pytz.timezone('US/Eastern')).isoformat()
        }), 500

def parse_date_with_fallback(date_str, current_time, timezone):
    """Función auxiliar para parsear fechas con múltiples formatos"""
    formats_to_try = [
        '%Y-%m-%dT%H:%M:%S%z',
        '%Y-%m-%d',
        '%Y-%m-%dT%H:%M:%S'
    ]
    
    for date_format in formats_to_try:
        try:
            date_obj = datetime.strptime(date_str, date_format)
            if date_format == '%Y-%m-%d':
                date_obj = timezone.localize(date_obj)
            return date_obj
        except ValueError:
            continue
    
    # Si ningún formato funciona, usar tiempo actual
    logger.warning(f"No se pudo parsear la fecha: {date_str}")
    return current_time

def build_response(results, current_time):
    """Función auxiliar para construir la respuesta"""
    return {
        "date": current_time.isoformat(),
        "results": results,
        "states_checked": [
            'tennessee', 'texas', 'maryland', 'ohio', 'georgia', 'new-jersey', 
            'south-carolina', 'michigan', 'maine', 'new-hampshire', 'iowa', 
            'rhode-island', 'kentucky', 'indiana', 'florida', 'pennsylvania', 
            'tennessee-2', 'texas-2', 'illinois', 'missouri', 'district-of-columbia',
            'massachusetts', 'arkansas', 'virginia', 'kansas', 'delaware', 
            'connecticut', 'new-york', 'wisconsin', 'north-carolina', 'new-mexico',
            'mississippi', 'colorado', 'oregon', 'california', 'idaho'
        ],
        "states_with_results": list(results.keys())
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
