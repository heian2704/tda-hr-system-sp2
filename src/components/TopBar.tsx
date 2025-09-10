import React from 'react';

const TopBar: React.FC = () => {
  const today = new Date();
  const day = today.toLocaleDateString('en-US', { weekday: 'long' });
  const date = today.toLocaleDateString('en-GB');

  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center">
        <span className="text-2xl font-semibold font-inter">
          <span className="text-[#FF6767]">TDA</span>
          <span className="text-gray-700">: HR</span>
        </span>
      </div>

      <div className="hidden sm:block text-sm text-gray-500 text-right">
        <div className="font-medium">{day}</div>
        <div className="text-blue-400 font-medium">{date}</div>
      </div>
    </header>
  );
};

export default TopBar;