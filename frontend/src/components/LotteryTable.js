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
    return isMobile ? (
      <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded flex justify-center items-center w-16 h-8">
        N/A
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded">
        No disponible
      </span>
    );
  }

  if (isMobile) {
    return (
      <div className="relative">
        <div 
          className="px-4 py-2 inline-flex text-xl leading-5 font-semibold rounded-full bg-green-100 text-green-800 cursor-pointer"
          onClick={copyToClipboard}
        >
          {result}
        </div>
        {copied && (
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-green-600 font-medium bg-white px-2 py-1 rounded shadow z-10">
            ¡Copiado!
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <span 
        className="px-4 py-2 inline-flex text-2xl leading-5 font-semibold rounded-full bg-green-100 text-green-800 cursor-pointer"
        onClick={copyToClipboard}
      >
        {result}
      </span>
      {copied && (
        <span className="absolute mt-10 text-sm text-green-600 font-medium bg-white px-2 py-1 rounded shadow">¡Copiado!</span>
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

  const renderMobileExpandedRow = (state) => (
    <tr className="sm:hidden">
      <td colSpan="2" className="px-2 py-2 bg-gray-50">
        <div className="text-xs text-gray-500">
          {messages[`${state}-Pick 3`] === messages[`${state}-Pick 4`] ? 
            messages[`${state}-Pick 3`] : 
            `Pick 3: ${messages[`${state}-Pick 3`]}, Pick 4: ${messages[`${state}-Pick 4`]}`}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Última actualización: {
            results[`${state}-Pick 3`]?.date === results[`${state}-Pick 4`]?.date ?
            formatDateTime(results[`${state}-Pick 3`]?.date) :
            `Pick 3: ${formatDateTime(results[`${state}-Pick 3`]?.date)}, Pick 4: ${formatDateTime(results[`${state}-Pick 4`]?.date)}`
          }
        </div>
      </td>
    </tr>
  );

  const renderDesktopRow = (state) => {
    const pick3Result = results[`${state}-Pick 3`];
    const pick4Result = results[`${state}-Pick 4`];
    const sameUpdateTime = pick3Result?.date === pick4Result?.date;

    return (
      <tr 
        className="hover:bg-indigo-50 transition-colors duration-150 ease-in-out cursor-pointer hidden sm:table-row"
        onClick={() => setExpandedState(expandedState === state ? null : state)}
      >
        <td className="px-4 py-3 text-base font-bold text-gray-900 text-center align-middle border-r border-gray-200">
          {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </td>
        <td className="px-2 py-3 text-sm text-gray-500 text-center align-middle">
          <ResultWithCopyButton result={pick3Result?.result} isMobile={false} />
        </td>
        <td className="px-2 py-3 text-sm text-gray-500 text-center align-middle">
          <ResultWithCopyButton result={pick4Result?.result} isMobile={false} />
        </td>
        <td className="px-2 py-3 text-xs text-gray-400 text-center align-middle">
          {sameUpdateTime ? (
            <span>Última actualización: {formatDateTime(pick3Result?.date)}</span>
          ) : (
            <>
              <div>Pick 3: {formatDateTime(pick3Result?.date)}</div>
              <div>Pick 4: {formatDateTime(pick4Result?.date)}</div>
            </>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-center border-b border-r border-gray-200" rowSpan="2">ESTADO</th>
            <th className="px-2 py-3 text-center border-b border-gray-200" colSpan="2">RESULTADOS</th>
            <th className="px-2 py-3 text-center border-b border-gray-200" rowSpan="2">ÚLTIMA ACTUALIZACIÓN</th>
          </tr>
          <tr className="bg-gray-100">
            <th className="px-2 py-2 text-center border-b border-r border-gray-200">PICK 3</th>
            <th className="px-2 py-2 text-center border-b border-gray-200">PICK 4</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stateOrder.map((state, index) => (
            <React.Fragment key={state}>
              {renderMobileRow(state)}
              {expandedState === state && renderMobileExpandedRow(state)}
              {renderDesktopRow(state)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryTable;
