import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LotteryTable from './LotteryTable'; // Asegúrate de importar el componente correcto

const LotteryResults = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('https://lottery-dash.onrender.com/api/lottery-results');
        console.log('Datos recibidos:', response.data);  // Log para depuración
        setResults(response.data.results);
        setMessages(response.data.messages);
        setLastUpdateTime(response.data.lastUpdateTime);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar los resultados:', err);  // Log de error detallado
        setError('Error al cargar los resultados de la lotería');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div className="text-center py-4">Cargando resultados...</div>;
  if (error) return <div className="text-center py-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-indigo-600 mb-8">Resultados de la Lotería</h1>
      <LotteryTable 
        results={results} 
        messages={messages} 
        lastUpdateTime={lastUpdateTime} 
      />
    </div>
  );
};

export default LotteryResults;
