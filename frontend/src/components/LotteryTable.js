import React, { useState } from 'react';

const stateOrder = [
  'tennessee', 'texas', 'maryland', 'ohio', 'georgia', 'new-jersey', 'south-carolina', 'michigan',
  'maine', 'new-hampshire', 'iowa', 'rhode-island', 'kentucky', 'indiana', 'florida',
  'pennsylvania', 'tennessee-2', 'texas-2', 'illinois', 'missouri', 'district-of-columbia',
  'massachusetts', 'arkansas', 'virginia', 'kansas', 'delaware', 'connecticut', 'new-york',
  'wisconsin', 'north-carolina', 'new-mexico', 'mississippi', 'colorado', 'oregon',
  'california', 'idaho'
];

const stateNames = {
  'district-of-columbia': 'WASHINGTON DC',
  'tennessee-2': 'TENNESSEE 2',
  'texas-2': 'TEXAS 2',
};

const ResultWithCopyButton = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center">
      <span className="px-4 py-2 inline-flex text-xl leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-2">
        {result}
      </span>
      <button
        onClick={copyToClipboard}
        className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        title="Copiar al portapapeles"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
      {copied && (
        <span className="ml-2 text-sm text-green-600 font-medium">¡Copiado!</span>
      )}
    </div>
  );
};

const LotteryTable = ({ results, messages, lastUpdateTime }) => {
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    if (typeof date === 'string' && date.includes('/')) {
      return date;
    }
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <table className="min-w-full bg-white">
      <tbody className="divide-y divide-gray-200">
        {stateOrder.map((state) => (
          <tr key={state} className="transition-colors duration-200 ease-in-out hover:bg-indigo-100 group">
            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900 group-hover:text-indigo-900">
              <div className="uppercase">
                {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
            </td>
            {['Pick 3', 'Pick 4'].map(lottery => {
              const key = `${state}-${lottery}`;
              const result = results[key];
              return (
                <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result && result.result ? (
                    <ResultWithCopyButton result={result.result} />
                  ) : (
                    <span className="px-4 py-2 inline-flex text-xl leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      No disponible
                    </span>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {messages[key]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Última actualización: {formatDateTime(result ? result.date : null)}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LotteryTable;
