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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cache_lock = Lock()
SCRAPING_TIMEOUT = 45  # Aumentamos el timeout a 45 segundos

@app.route('/')
def home():
    logger.info("Ruta home accedida")
    return jsonify({"message": "Bienvenido a la API de Lottery Dashboard"}), 200

@app.route('/api/lottery-results')
def get_lottery_results():
    try:
        with cache_lock:
            # Intentar obtener resultados del caché primero
            cached_results = cache.get('lottery_results')
            if cached_results:
                logger.info("Retornando resultados desde caché")
                return jsonify(cached_results)

            # Si no hay caché, iniciar scraping con timeout
            start_time = time.time()
            results = None
            
            try:
                results = scrape_all_lotteries()
                elapsed_time = time.time() - start_time
                
                if elapsed_time > SCRAPING_TIMEOUT:
                    logger.warning(f"Scraping completado pero tomó demasiado tiempo: {elapsed_time:.2f}s")
                    if cached_results:  # Si hay caché antiguo, usarlo
                        return jsonify(cached_results)
                    
            except Exception as e:
                logger.error(f"Error durante el scraping: {str(e)}")
                if cached_results:  # En caso de error, usar caché si existe
                    return jsonify(cached_results)
                results = {}

            # Si no hay resultados y no hay caché
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

            # Procesar fechas
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

            # Construir y guardar respuesta en caché
            response = build_response(results, current_time)
            cache['lottery_results'] = response
            logger.info(f"Nuevos resultados guardados en caché. Estados procesados: {len(results)}")
            return jsonify(response)

    except Exception as e:
        logger.exception("Error general en get_lottery_results")
        # En caso de error general, intentar usar caché
        cached_results = cache.get('lottery_results')
        if cached_results:
            logger.info("Retornando resultados antiguos del caché debido a error")
            return jsonify(cached_results)
            
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
