import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LotteryResults = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('https://lottery-dash.onrender.com/api/lottery-results');
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
            <th>Resultados</th>
          </tr>
        </thead>
        <tbody>
          {stateOrder.map((state) => {
            const games = results[state] || {};
            return (
              <tr key={state}>
                <td>{state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <div className="mb-2">
                    <strong>Pick 3:</strong> {results[`${state}-Pick 3`] ? (
                      <ResultWithCopyButton result={results[`${state}-Pick 3`].result} />
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
                        No disponible
                      </span>
                    )}
                  </div>
                  <div>
                    <strong>Pick 4:</strong> {results[`${state}-Pick 4`] ? (
                      <ResultWithCopyButton result={results[`${state}-Pick 4`].result} />
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
                        No disponible
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {messages[`${state}-Pick 3`]} {messages[`${state}-Pick 4`]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Última actualización: {formatDateTime(results[`${state}-Pick 3`]?.date)} {formatDateTime(results[`${state}-Pick 4`]?.date)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryResults;
