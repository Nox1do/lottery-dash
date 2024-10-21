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

const ResultWithCopyButton = ({ result, isMobile }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!result) {
    return (
      <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
        {isMobile ? "N/A" : "No disponible"}
      </span>
    );
  }

  if (isMobile) {
    return (
      <div 
        className="px-4 py-2 inline-flex text-xl leading-5 font-semibold rounded-full bg-green-100 text-green-800 cursor-pointer relative"
        onClick={copyToClipboard}
      >
        {result}
        {copied && (
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-green-600 font-medium bg-white px-2 py-1 rounded shadow">
            ¡Copiado!
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <span 
        className="px-4 py-2 inline-flex text-xl leading-5 font-semibold rounded-full bg-green-100 text-green-800 cursor-pointer"
        onClick={copyToClipboard}
      >
        {result}
      </span>
      {copied && (
        <span className="ml-2 text-sm text-green-600 font-medium">¡Copiado!</span>
      )}
    </div>
  );
};

const LotteryTable = ({ results, messages, lastUpdateTime }) => {
  const [expandedState, setExpandedState] = useState(null);

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

  const renderMobileRow = (state) => (
    <tr 
      className="hover:bg-indigo-100 cursor-pointer sm:hidden"
      onClick={() => setExpandedState(expandedState === state ? null : state)}
    >
      <td className="px-2 py-2 text-sm font-bold text-gray-900 text-center uppercase">
        {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </td>
      <td className="px-2 py-2 text-xs text-gray-500">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">PICK 3:</span>
            <ResultWithCopyButton result={results[`${state}-Pick 3`]?.result} isMobile={true} />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">PICK 4:</span>
            <ResultWithCopyButton result={results[`${state}-Pick 4`]?.result} isMobile={true} />
          </div>
        </div>
      </td>
    </tr>
  );

  const renderDesktopRow = (state) => (
    <tr 
      className="hover:bg-indigo-100 cursor-pointer hidden sm:table-row"
      onClick={() => setExpandedState(expandedState === state ? null : state)}
    >
      <td className="px-4 py-2 text-base font-bold text-gray-900 text-center">
        {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 text-center">
        <ResultWithCopyButton result={results[`${state}-Pick 3`]?.result} isMobile={false} />
        <div className="text-xs text-gray-400 mt-1">
          Última actualización: {formatDateTime(results[`${state}-Pick 3`]?.date)}
        </div>
      </td>
      <td className="px-4 py-2 text-sm text-gray-500 text-center">
        <ResultWithCopyButton result={results[`${state}-Pick 4`]?.result} isMobile={false} />
        <div className="text-xs text-gray-400 mt-1">
          Última actualización: {formatDateTime(results[`${state}-Pick 4`]?.date)}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 sm:px-4 py-3 text-center" rowSpan="2">ESTADO</th>
            <th className="px-2 sm:px-4 py-3 text-center sm:hidden">RESULTADOS</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell" colSpan="2">RESULTADOS</th>
          </tr>
          <tr className="bg-gray-100 hidden sm:table-row">
            <th className="px-4 py-3 text-center">PICK 3</th>
            <th className="px-4 py-3 text-center">PICK 4</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stateOrder.map((state) => (
            <React.Fragment key={state}>
              {renderMobileRow(state)}
              {renderDesktopRow(state)}
              {expandedState === state && (
                <tr className="sm:hidden">
                  <td colSpan="2" className="px-2 py-2 bg-gray-50">
                    <div className="text-xs text-gray-500">
                      {messages[`${state}-Pick 3`]} {messages[`${state}-Pick 4`]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Última actualización: {formatDateTime(results[`${state}-Pick 3`]?.date)} {formatDateTime(results[`${state}-Pick 4`]?.date)}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryTable;
