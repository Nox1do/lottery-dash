from flask import Flask, jsonify
from flask_cors import CORS
from scraper import scrape_all_lotteries
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

@app.route('/api/lottery-results')
def get_lottery_results():
    try:
        results = scrape_all_lotteries()
        eastern = pytz.timezone('US/Eastern')
        current_time = datetime.now(eastern)
        
        response = {
            "date": current_time.isoformat(),
            "results": results,
            "states_checked": [
                'tennessee', 'texas', 'maryland', 'ohio', 'georgia', 'new-jersey', 'south-carolina', 'michigan',
                'maine', 'new-hampshire', 'iowa', 'rhode-island', 'kentucky', 'indiana', 'florida',
                'pennsylvania', 'tennessee-2', 'texas-2', 'illinois', 'missouri', 'district-of-columbia',
                'massachusetts', 'arkansas', 'virginia', 'kansas', 'delaware', 'connecticut', 'new-york',
                'wisconsin', 'north-carolina', 'new-mexico', 'mississippi', 'colorado', 'oregon',
                'california', 'idaho'
            ],
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": "Error Interno del Servidor"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
