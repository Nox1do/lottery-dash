import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LotteryResults = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/lottery-results');
        console.log('Datos recibidos:', response.data);  // Log para depuración
        setResults(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar los resultados:', err);  // Log de error detallado
        setError('Error al cargar los resultados de la lotería');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div>Cargando resultados...</div>;
  if (error) return <div>{error}</div>;

  const stateOrder = [
    'tennessee', 'iowa', 'rhode-island', 'district-of-columbia', 'kansas', 'wisconsin',
    'north-carolina', 'new-mexico', 'mississippi', 'colorado', 'oregon',
    'california', 'idaho'
  ];

  return (
    <div>
      <h1>Resultados de la Lotería</h1>
      <table>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Pick 3</th>
            <th>Pick 4</th>
          </tr>
        </thead>
        <tbody>
          {stateOrder.map((state) => {
            const games = results[state] || {};
            return (
              <tr key={state}>
                <td>{state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</td>
                <td>{games['Pick 3'] || 'N/A'}</td>
                <td>{games['Pick 4'] || 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryResults;
