from flask import Flask, jsonify
from flask_cors import CORS
from scraper import scrape_all_lotteries
from datetime import datetime
import pytz

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Bienvenido a la API de Lottery Dashboard"}), 200

@app.route('/api/lottery-results')
def get_lottery_results():
    results = scrape_all_lotteries()
    eastern = pytz.timezone('US/Eastern')
    current_time = datetime.now(eastern)
    
    for state, state_results in results.items():
        for lottery, lottery_result in state_results.items():
            if 'date' in lottery_result:
                date_str = lottery_result['date']
                try:
                    # Intenta parsear la fecha con el formato completo
                    date_obj = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S%z')
                except ValueError:
                    try:
                        # Si falla, intenta con el formato sin zona horaria
                        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                        date_obj = eastern.localize(date_obj)
                    except ValueError:
                        # Si ambos fallan, intenta separar la fecha y la hora
                        date_parts = date_str.split('T')
                        if len(date_parts) == 2:
                            try:
                                date_obj = datetime.strptime(date_parts[0], '%Y-%m-%d')
                                date_obj = eastern.localize(date_obj)
                            except ValueError:
                                print(f"Error parsing date for {state} - {lottery}: {date_str}")
                                date_obj = current_time
                        else:
                            print(f"Error parsing date for {state} - {lottery}: {date_str}")
                            date_obj = current_time
                
                lottery_result['date'] = date_obj.isoformat()
    
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
        "states_with_results": list(results.keys())
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
