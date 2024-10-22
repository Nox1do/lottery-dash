import React from 'react';

const LotteryResults = ({ results, messages }) => {
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
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

  const getStatusMessage = (status) => {
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

  return (
    <div className="space-y-4">
      {Object.entries(results).map(([state, data]) => (
        <div key={state} className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{state}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{getStatusMessage(data.status)}</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pick 3</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {data['Pick 3']?.numbers || 'N/A'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pick 4</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {data['Pick 4']?.numbers || 'N/A'}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Última actualización</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDateTime(data['Pick 3']?.date || data['Pick 4']?.date)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ))}
      {messages.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{messages.general}</span>
        </div>
      )}
    </div>
  );
};

export default LotteryResults;
