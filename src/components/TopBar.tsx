import React from 'react';

const TopBar = () => {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-2xl font-semibold">
          <span className="text-red-400">TDA</span>
          <span className="text-gray-700">: HR</span>
        </span>
      </div>
      <div className="text-sm text-gray-500">
        <div>Tuesday</div>
        <div>13/05/2025</div>
      </div>
    </div>
  );
};

export default TopBar;
