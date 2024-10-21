import React, { useState, useEffect, useCallback } from 'react';
import LotteryTable from './LotteryTable';

const LOTTERIES = ['Pick 3', 'Pick 4'];
const STATES = [
  'tennessee', 'texas', 'maryland', 'ohio', 'georgia', 'new-jersey', 'south-carolina', 'michigan',
  'maine', 'new-hampshire', 'iowa', 'rhode-island', 'kentucky', 'indiana', 'florida',
  'pennsylvania', 'tennessee-2', 'texas-2', 'illinois', 'missouri', 'district-of-columbia',
  'massachusetts', 'arkansas', 'virginia', 'kansas', 'delaware', 'connecticut', 'new-york',
  'wisconsin', 'north-carolina', 'new-mexico', 'mississippi', 'colorado', 'oregon',
  'california', 'idaho'
];

function Dashboard() {
  const [results, setResults] = useState(() => {
    const savedResults = localStorage.getItem('lotteryResults');
    return savedResults ? JSON.parse(savedResults) : {};
  });
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(() => {
    return localStorage.getItem('lastUpdateTime') || null;
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const processResult = useCallback((state, lottery, result, serverDate) => {
    if (result && result.numbers && result.date) {
      const resultDate = new Date(result.date);
      const serverDateTime = new Date(serverDate);
      
      resultDate.setHours(serverDateTime.getHours());
      resultDate.setMinutes(serverDateTime.getMinutes());
      resultDate.setSeconds(serverDateTime.getSeconds());

      const formattedDate = resultDate.toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return {
        result: { 
          result: result.numbers, 
          date: formattedDate
        },
        message: "Resultados Actualizados"
      };
    } else {
      return {
        result: { result: null, date: null },
        message: "N/A"
      };
    }
  }, []);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('https://lottery-dash.onrender.com/api/lottery-results');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const serverUpdateTime = new Date(data.date).toLocaleString('en-US', { 
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setLastUpdateTime(serverUpdateTime);
      localStorage.setItem('lastUpdateTime', serverUpdateTime);
      
      const newResults = {};
      const newMessages = {};

      STATES.forEach(state => {
        if (data.results[state]) {
          LOTTERIES.forEach(lottery => {
            const key = `${state}-${lottery}`;
            const result = data.results[state][lottery];
            if (result) {
              const { result: processedResult, message } = processResult(state, lottery, result, data.date);
              newResults[key] = processedResult;
              newMessages[key] = message;
            } else {
              newResults[key] = { result: null, date: null };
              newMessages[key] = "N/A";
            }
          });
        } else {
          LOTTERIES.forEach(lottery => {
            const key = `${state}-${lottery}`;
            newResults[key] = { result: null, date: null };
            newMessages[key] = "N/A";
          });
        }
      });

      setResults(newResults);
      localStorage.setItem('lotteryResults', JSON.stringify(newResults));
      setMessages(newMessages);
    } catch (err) {
      console.error('Error:', err);
      setMessages({ general: `Error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }, [processResult]);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 120000); // 2 minutos
    return () => clearInterval(interval);
  }, [fetchResults]);

  const handleUpdate = useCallback(async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    const startTime = Date.now();
    
    try {
      await fetchResults();
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
      
      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      setIsUpdating(false);
    }
  }, [fetchResults, isUpdating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
          Lottery Dashboard
        </h1>
        {lastUpdateTime && (
          <p className="text-center text-gray-600 mb-4">
            Última actualización general: {lastUpdateTime}
          </p>
        )}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`
              bg-indigo-600 text-white font-semibold py-2 px-6 rounded-md
              flex items-center justify-center
              transition-all duration-300 ease-in-out
              ${isUpdating ? 'opacity-75' : 'hover:bg-indigo-700'}
            `}
          >
            <svg 
              className={`h-5 w-5 mr-2 ${isUpdating ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {isUpdating ? 'Actualizando...' : 'Actualizar Resultados'}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
          <LotteryTable 
            results={results} 
            messages={messages} 
            lastUpdateTime={lastUpdateTime} 
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
