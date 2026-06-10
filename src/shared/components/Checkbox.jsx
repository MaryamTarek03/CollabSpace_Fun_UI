import React from 'react';
import { Check } from 'lucide-react';

/**
 * Reusable Custom Checkbox component with Neobrutalist styling.
 */
export default function Checkbox({
    checked,
    onChange,
    disabled = false,
    label,
    description,
    className = '',
    children
}) {
    return (
        <label className={`flex items-start gap-3 p-2 hover:bg-white border-2 border-transparent hover:border-black rounded-xl transition-all cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
            <div className="relative flex items-center shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={onChange}
                    className="peer sr-only"
                />
                <div className="w-[18px] h-[18px] border-2 border-black rounded bg-white transition-all flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] peer-checked:bg-purple-500 peer-checked:shadow-none peer-checked:translate-x-px peer-checked:translate-y-px">
                    {checked && <Check size={11} className="text-white stroke-[4]" />}
                </div>
            </div>
            {children ? children : (
                <div>
                    {label && <span className="text-xs font-bold text-gray-800 block leading-tight">{label}</span>}
                    {description && <span className="text-[10px] text-gray-400 block leading-tight mt-0.5">{description}</span>}
                </div>
            )}
        </label>
    );
}
