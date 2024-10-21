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
      <span className="px-2 py-1 text-sm font-semibold bg-gray-200 text-gray-700 rounded">
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
    <div className="flex items-center justify-center group relative">
      <span 
        className="px-4 py-2 inline-flex text-2xl leading-5 font-semibold rounded-lg bg-green-100 text-green-800 cursor-pointer transition-colors duration-150 ease-in-out group-hover:bg-green-200"
        onClick={copyToClipboard}
      >
        {result}
      </span>
      {copied && (
        <span className="absolute -bottom-6 text-xs text-green-600 font-medium bg-white px-2 py-1 rounded shadow">¡Copiado!</span>
      )}
      <button
        onClick={copyToClipboard}
        className="ml-1 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        title="Copiar al portapapeles"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-500 hover:text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
  );
};

const MobileResultCard = ({ state, pick3, pick4, lastUpdate, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand();
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden transition-all duration-300 ease-in-out">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="text-lg font-semibold text-gray-800">
          {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </h3>
        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-4 pb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">PICK 3:</span>
            <ResultWithCopyButton result={pick3?.result} isMobile={true} />
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">PICK 4:</span>
            <ResultWithCopyButton result={pick4?.result} isMobile={true} />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Última actualización: {formatDateTime(lastUpdate)}
          </div>
        </div>
      </div>
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

  const renderMobileView = () => (
    <div className="sm:hidden">
      {stateOrder.map((state) => (
        <MobileResultCard
          key={state}
          state={state}
          pick3={results[`${state}-Pick 3`]}
          pick4={results[`${state}-Pick 4`]}
          lastUpdate={results[`${state}-Pick 3`]?.date}
          onExpand={() => setExpandedState(state)}
        />
      ))}
    </div>
  );

  return (
    <div className="overflow-x-auto">
      {renderMobileView()}
      <table className="w-full bg-white border-collapse border border-gray-200 hidden sm:table">
        <thead>
          <tr className="bg-gray-100 sm:hidden">
            <th className="px-2 py-2 text-center border-b border-r border-gray-200 w-1/2">ESTADO</th>
            <th className="px-2 py-2 text-center border-b border-gray-200 w-1/2">RESULTADOS</th>
          </tr>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-center border-b border-r border-gray-200" rowSpan="2">ESTADO</th>
            <th className="px-2 py-2 text-center border-b border-gray-200" colSpan="2">RESULTADOS</th>
            <th className="px-2 py-3 text-center border-b border-gray-200" rowSpan="2">ÚLTIMA<br/>ACTUALIZACIÓN</th>
          </tr>
          <tr className="bg-gray-100">
            <th className="px-2 py-2 text-center border-b border-r border-gray-200">PICK 3</th>
            <th className="px-2 py-2 text-center border-b border-r border-gray-200">PICK 4</th>
          </tr>
        </thead>
        <tbody>
          {stateOrder.map((state, index) => (
            <React.Fragment key={state}>
              {renderMobileRow(state)}
              {expandedState === state && renderMobileExpandedRow(state)}
              {renderDesktopRow(state, index)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryTable;
