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

const sorteoHoras = {
  'tennessee': '10:28:00 AM',
  'texas': '11:00:00 AM',
  'maryland': '12:28:00 PM',
  'ohio': '12:29:00 PM',
  'georgia': '12:29:00 PM',
  'michigan': '12:59:00 PM',
  'new-jersey': '12:59:00 PM',
  'south-carolina': '12:59:00 PM',
  'maine': '1:10:00 PM',
  'new-hampshire': '1:10:00 PM',
  'indiana': '1:20:00 PM',
  'iowa': '1:20:00 PM',
  'kentucky': '1:20:00 PM',
  'texas-2': '1:27:00 PM',
  'tennessee-2': '1:28:00 PM',
  'florida': '1:30:00 PM',
  'rhode-island': '1:30:00 PM',
  'pennsylvania': '1:35:00 PM',
  'illinois': '1:40:00 PM',
  'missouri': '1:45:00 PM',
  'district-of-columbia': '1:50:00 PM',
  'connecticut': '1:57:00 PM',
  'delaware': '1:58:00 PM',
  'arkansas': '1:59:00 PM',
  'virginia': '1:59:00 PM',
  'massachusetts': '2:00:00 PM',
  'kansas': '2:10:00 PM',
  'new-york': '2:30:00 PM',
  'wisconsin': '2:30:00 PM',
  'north-carolina': '3:00:00 PM',
  'new-mexico': '3:00:00 PM',
  'mississippi': '3:30:00 PM',
  'colorado': '3:30:00 PM',
  'california': '4:00:00 PM',
  'oregon': '4:00:00 PM',
  'idaho': '4:00:00 PM'
};

const LotteryTable = ({ results, messages, lastUpdateTime }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleString('es-ES', { 
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const ResultWithCopyButton = ({ result, label }) => {
    const [copied, setCopied] = useState(false);
  
    const copyToClipboard = useCallback(() => {
      navigator.clipboard.writeText(result).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }, [result]);
  
    if (!result) return <span className="text-gray-500">N/A</span>;
  
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium text-gray-500 mb-1">{label}</span>
        <button
          onClick={copyToClipboard}
          className="text-lg font-bold bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors duration-200"
        >
          {result}
        </button>
        {copied && (
          <span className="mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg">
            Copiado!
          </span>
        )}
      </div>
    );
  };

  const getStatusMessage = (state) => {
    const status = results[state]?.status;
    switch(status) {
      case 'not_time':
        return 'Aún no es hora del sorteo';
      case 'not_available':
        return 'Resultado no disponible';
      case 'found':
        return 'Resultado encontrado';
      default:
        return 'Estado desconocido';
    }
  };

  const sortedAndFilteredStates = useMemo(() => {
    return stateOrder
      .filter(state => state.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const resultA = results[a]?.status === 'found';
        const resultB = results[b]?.status === 'found';
        if (resultA && !resultB) return -1;
        if (!resultA && resultB) return 1;
        return 0;
      });
  }, [results, searchTerm]);

  const renderMobileView = () => (
    <div className="sm:hidden">
      <div className="sticky top-0 bg-white z-10 pb-4">
        <div className="flex justify-center items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Resultados de Lotería</h2>
        </div>
        <input
          type="text"
          placeholder="Buscar estado..."
          className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="mt-4 space-y-6">
        {sortedAndFilteredStates.map((state) => (
          <div key={state} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              {stateNames[state] || state.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h3>
            <div className="flex justify-around">
              <ResultWithCopyButton result={results[state]?.['Pick 3']?.numbers} label="PICK 3" />
              <ResultWithCopyButton result={results[state]?.['Pick 4']?.numbers} label="PICK 4" />
            </div>
            <div className="mt-3 text-sm text-center text-gray-500">
              Última actualización: {formatDateTime(results[state]?.['Pick 3']?.date || results[state]?.['Pick 4']?.date)}
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
          <th className="px-4 py-2 text-left text-xl font-bold">Estado</th>
          <th className="px-4 py-2 text-center text-xl font-bold">Pick 3</th>
          <th className="px-4 py-2 text-center text-xl font-bold">Pick 4</th>
          <th className="px-4 py-2 text-center text-xl font-bold">Hora del Sorteo</th>
          <th className="px-4 py-2 text-center text-xl font-bold">Estado</th>
          <th className="px-4 py-2 text-center text-xl font-bold">Última Actualización</th>
        </tr>
      </thead>
      <tbody>
        {sortedAndFilteredStates.map((state) => (
          <tr key={state} className="border-t border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-2 text-xl font-bold">
              {(stateNames[state] || state.replace(/-/g, ' ')).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
            </td>
            <td className="px-4 py-2 text-center">
              <ResultWithCopyButton result={results[state]?.['Pick 3']?.numbers} label="PICK 3" />
            </td>
            <td className="px-4 py-2 text-center">
              <ResultWithCopyButton result={results[state]?.['Pick 4']?.numbers} label="PICK 4" />
            </td>
            <td className="px-4 py-2 text-center text-sm text-gray-500">
              {sorteoHoras[state] || 'N/A'}
            </td>
            <td className="px-4 py-2 text-center text-sm text-gray-500">
              {getStatusMessage(state)}
            </td>
            <td className="px-4 py-2 text-center text-sm text-gray-500">
              {formatDateTime(results[state]?.['Pick 3']?.date || results[state]?.['Pick 4']?.date)}
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
