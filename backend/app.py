from flask import Flask, jsonify
from flask_cors import CORS
from scraper import scrape_all_lotteries
from constants import sorteoHoras, stateOrder
from datetime import datetime
import pytz
import os
import logging

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://lottery-dash.vercel.app"}})

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de Flask para recursos limitados
app.config['PROPAGATE_EXCEPTIONS'] = True
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024  # Limitar payload a 1MB

@app.route('/')
def home():
    logger.info("Ruta home accedida")
    return jsonify({"message": "Bienvenido a la API de Lottery Dashboard"}), 200

@app.route('/api/lottery-schedule')
def get_lottery_schedule():
    """
    Nueva ruta para obtener el horario de sorteos
    """
    return jsonify(sorteoHoras)

@app.route('/api/lottery-results')
def get_lottery_results():
    logger.info("Ruta /api/lottery-results accedida")
    try:
        results = scrape_all_lotteries()
        eastern = pytz.timezone('US/Eastern')
        current_time = datetime.now(eastern)
        
        response = {
            "date": current_time.isoformat(),
            "results": results or {},
            "schedule": sorteoHoras,
            "states_checked": stateOrder,
            "states_with_results": list(results.keys() if results else [])
        }
        
        logger.info(f"Retornando resultados para {len(results) if results else 0} estados")
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error en get_lottery_results: {str(e)}")
        return jsonify({
            "error": "Error Interno del Servidor",
            "message": str(e),
            "results": {},
            "states_checked": [],
            "states_with_results": []
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

# No se encontraron importaciones de LotteryResults
