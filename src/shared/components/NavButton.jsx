import React from 'react';
import Tooltip from './Tooltip';

export default function NavButton({ icon, active, tooltip, onClick, className = '', iconClassName = '' }) {
    return (
        <button
            onClick={onClick}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group relative ${active
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(168,85,247,1)] scale-110'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-black active:scale-95'
                } ${className}`}
        >
            <span className={`transition-transform duration-300 flex items-center justify-center ${iconClassName}`}>
                {icon}
            </span>
            {/* Tooltip */}
            <Tooltip text={tooltip} />
        </button>
    );
}
