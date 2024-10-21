import React, { useState, useCallback, useMemo } from 'react';
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';

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

const LotteryTable = ({ results, messages, lastUpdateTime }) => {
  const [activeTab, setActiveTab] = useState('pick3');
  const [favoriteStates, setFavoriteStates] = useState(() => {
    const saved = localStorage.getItem('favoriteStates');
    return saved ? JSON.parse(saved) : [];
  });

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

  const toggleFavorite = useCallback((state) => {
    setFavoriteStates(prev => {
      const newFavorites = prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state];
      localStorage.setItem('favoriteStates', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const sortedStates = useMemo(() => {
    return stateOrder.sort((a, b) => {
      if (favoriteStates.includes(a) && !favoriteStates.includes(b)) return -1;
      if (!favoriteStates.includes(a) && favoriteStates.includes(b)) return 1;
      return 0;
    });
  }, [favoriteStates]);

  const MobileResultCard = ({ state }) => {
    const isFavorite = favoriteStates.includes(state);
    const pick3Result = results[`${state}-Pick 3`];
    const pick4Result = results[`${state}-Pick 4`];

    return (
      <SwipeableListItem
        swipeLeft={{
          content: <div className="bg-red-500 h-full flex items-center justify-center text-white px-4">Eliminar favorito</div>,
          action: () => toggleFavorite(state)
        }}
        swipeRight={{
          content: <div className="bg-green-500 h-full flex items-center justify-center text-white px-4">Añadir a favoritos</div>,
          action: () => toggleFavorite(state)
        }}
      >
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h3>
            <button onClick={() => toggleFavorite(state)} className="focus:outline-none">
              <svg className={`w-6 h-6 ${isFavorite ? 'text-yellow-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold text-indigo-600">
              {activeTab === 'pick3' ? pick3Result?.result : pick4Result?.result}
            </div>
            <div className="text-sm text-gray-500">
              {formatDateTime(activeTab === 'pick3' ? pick3Result?.date : pick4Result?.date)}
            </div>
          </div>
        </div>
      </SwipeableListItem>
    );
  };

  const renderMobileView = () => (
    <div className="sm:hidden">
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'pick3' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-lg focus:outline-none`}
          onClick={() => setActiveTab('pick3')}
        >
          Pick 3
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'pick4' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-lg focus:outline-none`}
          onClick={() => setActiveTab('pick4')}
        >
          Pick 4
        </button>
      </div>
      <SwipeableList>
        {sortedStates.map((state) => (
          <MobileResultCard key={state} state={state} />
        ))}
      </SwipeableList>
    </div>
  );

  const renderDesktopRow = (state, index) => (
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
              {renderDesktopRow(state, index)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryTable;
