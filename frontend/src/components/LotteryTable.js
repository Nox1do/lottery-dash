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
            <tr 
              className={`hidden sm:table-row ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-indigo-50 transition-colors duration-150 ease-in-out`}
            >
              <td className="px-4 py-3 text-base font-bold text-gray-900 text-center align-middle border-r border-gray-200">
                {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </td>
              <td className="px-2 py-3 text-sm text-gray-500 text-center align-middle border-r border-gray-200">
                <ResultWithCopyButton result={results[`${state}-Pick 3`]?.result} isMobile={false} />
              </td>
              <td className="px-2 py-3 text-sm text-gray-500 text-center align-middle border-r border-gray-200">
                <ResultWithCopyButton result={results[`${state}-Pick 4`]?.result} isMobile={false} />
              </td>
              <td className="px-2 py-3 text-xs text-gray-400 text-center align-middle">
                {formatDateTime(results[`${state}-Pick 3`]?.date)}
              </td>
            </tr>
          </React.Fragment>
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
