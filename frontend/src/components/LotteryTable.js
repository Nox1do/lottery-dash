import React, { useState } from 'react';

// ... (código anterior sin cambios)

const LotteryTable = ({ results, messages, lastUpdateTime }) => {
  const [expandedState, setExpandedState] = useState(null);

  // ... (formatDateTime y otras funciones sin cambios)

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
            <span className="font-semibold w-16 text-right mr-2">PICK 3:</span>
            <ResultWithCopyButton result={results[`${state}-Pick 3`]?.result} isMobile={true} />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold w-16 text-right mr-2">PICK 4:</span>
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100 sm:hidden">
            <th className="px-2 py-2 text-center border-b border-r border-gray-200">ESTADO</th>
            <th className="px-2 py-2 text-center border-b border-gray-200">RESULTADOS</th>
          </tr>
          {/* ... (encabezado de escritorio sin cambios) */}
        </thead>
        <tbody>
          {stateOrder.map((state, index) => (
            <React.Fragment key={state}>
              {renderMobileRow(state)}
              {expandedState === state && renderMobileExpandedRow(state)}
              {/* ... (renderizado de escritorio sin cambios) */}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LotteryTable;
