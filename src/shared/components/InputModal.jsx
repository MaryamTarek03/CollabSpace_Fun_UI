import React, { useState } from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store';

export default function InputModal() {
    const { inputModal, closeInputModal } = useUIStore();
    const { isOpen, title, message, inputLabel, inputPlaceholder, confirmText, cancelText, type, onConfirm } = inputModal;
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm(inputValue);
        setInputValue('');
        closeInputModal();
    };

    const handleClose = () => {
        setInputValue('');
        closeInputModal();
    };

    const styles = {
        danger: {
            icon: <AlertTriangle size={32} className="text-red-500" />,
            bg: 'bg-red-50',
            button: 'bg-red-500 hover:bg-red-600 border-red-500 text-white',
        },
        warning: {
            icon: <AlertCircle size={32} className="text-yellow-500" />,
            bg: 'bg-accent-50',
            button: 'bg-accent hover:bg-accent-dark border-accent text-black',
        },
        info: {
            icon: <Info size={32} className="text-blue-500" />,
            bg: 'bg-blue-50',
            button: 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white',
        },
    };

    const currentStyle = styles[type] || styles.danger;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-in zoom-in-95 swing-in-top-fwd duration-300">
                <div className={`w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${currentStyle.bg}`}>
                    {currentStyle.icon}
                </div>

                <h3 className="text-2xl font-black mb-2 leading-tight">{title}</h3>
                <p className="text-gray-600 font-medium mb-4 leading-relaxed">
                    {message}
                </p>

                {/* Input Field */}
                <div className="mb-6">
                    {inputLabel && (
                        <label className="block text-sm font-bold text-gray-700 mb-2">{inputLabel}</label>
                    )}
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={inputPlaceholder || 'Enter your message...'}
                        className="w-full px-4 py-3 border-2 border-black rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                    />
                    <p className="text-xs text-gray-400 mt-1">Optional</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 px-4 bg-white border-2 border-black rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 py-3 px-4 border-2 border-black rounded-xl font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none ${currentStyle.button}`}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
