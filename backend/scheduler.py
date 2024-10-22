from datetime import datetime, timedelta
import pytz
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class LotteryScheduler:
    def __init__(self):
        self.eastern = pytz.timezone('US/Eastern')
        self.active_searches = defaultdict(lambda: {
            'start_time': None,
            'found': False,
            'attempts': 0
        })
        
    def should_search_state(self, state, draw_time_str, current_results):
        """
        Determina si se debe buscar un estado específico basado en la hora del sorteo
        """
        current_time = datetime.now(self.eastern)
        
        # Si ya tenemos resultados para este estado hoy, no buscar
        if state in current_results:
            return False
            
        try:
            # Convertir la hora del sorteo a datetime
            draw_time = datetime.strptime(draw_time_str, '%I:%M:%S %p').time()
            draw_datetime = datetime.combine(current_time.date(), draw_time)
            draw_datetime = self.eastern.localize(draw_datetime)
            
            # Si el estado no está en búsqueda activa
            if self.active_searches[state]['start_time'] is None:
                # Iniciar búsqueda si estamos dentro de los 5 minutos antes del sorteo
                if current_time >= draw_datetime - timedelta(minutes=5):
                    self.active_searches[state]['start_time'] = current_time
                    return True
                return False
                
            # Si ya está en búsqueda activa
            search_start = self.active_searches[state]['start_time']
            search_duration = current_time - search_start
            
            # Detener búsqueda después de 30 minutos
            if search_duration > timedelta(minutes=30):
                self.active_searches[state]['start_time'] = None
                return False
                
            # Incrementar contador de intentos
            self.active_searches[state]['attempts'] += 1
            
            # Limitar frecuencia de intentos (cada 2 minutos)
            return search_duration.seconds % 120 == 0
            
        except ValueError as e:
            logger.error(f"Error procesando hora para {state}: {e}")
            return False
            
    def mark_state_found(self, state):
        """
        Marca un estado como encontrado para detener su búsqueda
        """
        self.active_searches[state]['found'] = True
        self.active_searches[state]['start_time'] = None
