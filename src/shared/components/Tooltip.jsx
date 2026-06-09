import React from 'react';

export default function Tooltip({ text, position = 'right' }) {
    const positionClasses = {
        right: 'left-14',
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    };

    return (
        <span className={`absolute ${positionClasses[position]} bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50`}>
            {text}
        </span>
    );
}
