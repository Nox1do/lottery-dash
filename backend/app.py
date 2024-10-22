from flask import Flask, jsonify
from flask_cors import CORS
from scraper import scrape_all_lotteries
from datetime import datetime
import pytz

app = Flask(__name__)
CORS(app)

last_scrape_time = None
cached_results = None
eastern = pytz.timezone('America/New_York')

@app.route('/')
def home():
    return jsonify({"message": "Bienvenido a la API de Lottery Dashboard"}), 200

@app.route('/api/lottery-results')
def get_lottery_results():
    global last_scrape_time, cached_results
    
    current_time = datetime.now(eastern)
    
    # Evitar scraping más frecuente que cada 5 minutos
    if last_scrape_time is None or (current_time - last_scrape_time).total_seconds() > 300:
        results = scrape_all_lotteries()
        last_scrape_time = current_time
        cached_results = results
    else:
        results = cached_results
    
    response = {
        'results': results,
        'scrape_time': last_scrape_time.isoformat()
    }
    return jsonify(response)

@app.route('/api/test')
def test():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(debug=True)
