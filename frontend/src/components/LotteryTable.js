import React, { useState, useCallback, useMemo } from 'react';

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

const LotteryTable = ({ results, messages, lastUpdateTime }) => {
  const [activeTab, setActiveTab] = useState('pick3');
  const [searchTerm, setSearchTerm] = useState('');

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

  const ResultWithCopyButton = ({ result, isMobile }) => {
    const [copied, setCopied] = useState(false);
  
    const copyToClipboard = useCallback(() => {
      navigator.clipboard.writeText(result).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }, [result]);
  
    if (!result) return <span className="text-gray-400">N/A</span>;
  
    return (
      <div className="relative inline-block">
        <button
          onClick={copyToClipboard}
          className={`${
            isMobile
              ? 'text-sm bg-green-100 text-green-800 px-2 py-1 rounded'
              : 'text-base bg-green-100 text-green-800 px-3 py-1 rounded-full'
          } font-medium hover:bg-green-200 transition-colors duration-200`}
        >
          {result}
        </button>
        {copied && (
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg">
            Copiado!
          </span>
        )}
      </div>
    );
  };

  const ResultBadge = ({ result }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      {result || 'N/A'}
    </span>
  );

  const sortedAndFilteredStates = useMemo(() => {
    return stateOrder
      .filter(state => state.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const resultA = results[`${a}-${activeTab === 'pick3' ? 'Pick 3' : 'Pick 4'}`]?.result;
        const resultB = results[`${b}-${activeTab === 'pick3' ? 'Pick 3' : 'Pick 4'}`]?.result;
        if (resultA && !resultB) return -1;
        if (!resultA && resultB) return 1;
        return 0;
      });
  }, [results, activeTab, searchTerm]);

  const renderMobileView = () => (
    <div className="sm:hidden">
      <div className="sticky top-0 bg-white z-10 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Resultados de Lotería</h2>
          <span className="text-sm text-gray-500">
            Última actualización: {formatDateTime(lastUpdateTime)}
          </span>
        </div>
        <div className="flex space-x-2 mb-4">
          <button
            className={`flex-1 py-2 px-4 rounded-full font-medium ${
              activeTab === 'pick3' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveTab('pick3')}
          >
            Pick 3
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-full font-medium ${
              activeTab === 'pick4' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setActiveTab('pick4')}
          >
            Pick 4
          </button>
        </div>
        <input
          type="text"
          placeholder="Buscar estado..."
          className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="mt-4 space-y-4">
        {sortedAndFilteredStates.map((state) => (
          <div key={state} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              <ResultBadge result={results[`${state}-${activeTab === 'pick3' ? 'Pick 3' : 'Pick 4'}`]?.result} />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Última actualización: {formatDateTime(results[`${state}-${activeTab === 'pick3' ? 'Pick 3' : 'Pick 4'}`]?.date)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDesktopView = () => (
    <table className="w-full bg-white border-collapse border border-gray-200 hidden sm:table">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 text-left">Estado</th>
          <th className="px-4 py-2 text-center">Pick 3</th>
          <th className="px-4 py-2 text-center">Pick 4</th>
          <th className="px-4 py-2 text-center">Última Actualización</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredStates.map((state) => (
          <tr key={state} className="border-t border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2">{stateNames[state] || state}</td>
            <td className="px-4 py-2 text-center">
              <ResultWithCopyButton result={results[`${state}-Pick 3`]?.result} isMobile={false} />
            </td>
            <td className="px-4 py-2 text-center">
              <ResultWithCopyButton result={results[`${state}-Pick 4`]?.result} isMobile={false} />
            </td>
            <td className="px-4 py-2 text-center text-sm text-gray-500">
              {formatDateTime(results[`${state}-Pick 3`]?.date)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="overflow-x-auto">
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
};

export default LotteryTable;
