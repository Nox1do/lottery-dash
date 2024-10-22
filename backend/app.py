from flask import Flask, jsonify
from flask_cors import CORS
from scraper import scrape_all_lotteries, sorteoHoras
from datetime import datetime
import pytz
import os
import logging

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://lottery-dash.vercel.app"}}, methods=["GET"], allow_headers=["Content-Type", "Authorization"])


# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        for state, state_results in results.items():
            for lottery, lottery_result in state_results.items():
                if 'date' in lottery_result:
                    date_str = lottery_result['date']
                    try:
                        date_obj = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S%z')
                    except ValueError:
                        try:
                            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                            date_obj = eastern.localize(date_obj)
                        except ValueError:
                            date_parts = date_str.split('T')
                            if len(date_parts) == 2:
                                try:
                                    date_obj = datetime.strptime(date_parts[0], '%Y-%m-%d')
                                    date_obj = eastern.localize(date_obj)
                                except ValueError:
                                    logger.error(f"Error al parsear la fecha para {state} - {lottery}: {date_str}")
                                    date_obj = current_time
                            else:
                                logger.error(f"Error al parsear la fecha para {state} - {lottery}: {date_str}")
                                date_obj = current_time
                    lottery_result['date'] = date_obj.isoformat()
        
        response = {
            "date": current_time.isoformat(),
            "results": results,
            "schedule": sorteoHoras,
            "states_checked": stateOrder,
            "states_with_results": list(results.keys())
        }
        logger.info("Resultados de la lotería procesados exitosamente")
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"error": "Error Interno del Servidor"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
