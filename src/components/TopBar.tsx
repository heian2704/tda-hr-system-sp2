import React from 'react';

const TopBar = () => {
  const today = new Date();

  const dayName = today.toLocaleDateString(undefined, { weekday: 'long' });

  // Format date as dd/mm/yyyy
  const formattedDate = today.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-2xl font-semibold">
          <span className="text-red-400">TDA</span>
          <span className="text-gray-700">: HR</span>
        </span>
      </div>
      <div className="text-sm text-gray-500">
        <div>{dayName}</div>
        <div>{formattedDate}</div>
      </div>
    </div>
  );
};

export default TopBar;
