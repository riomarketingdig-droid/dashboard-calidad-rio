import { useState } from 'react';

export default function InfoTooltip({ content }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {show && (
        <div className="absolute z-50 w-64 p-3 mt-2 text-xs bg-slate-800 text-white rounded-lg shadow-lg right-0">
          <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-800 rotate-45"></div>
          {content}
        </div>
      )}
    </div>
  );
}
