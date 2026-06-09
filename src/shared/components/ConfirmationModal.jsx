import React from 'react';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store';

export default function ConfirmationModal() {
    const { confirmationModal, closeConfirmation } = useUIStore();
    const { isOpen, title, message, confirmText, cancelText, type, onConfirm } = confirmationModal;

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        closeConfirmation();
    };

    const styles = {
        danger: {
            icon: <AlertTriangle size={32} className="text-red-500" />,
            bg: 'bg-red-50',
            button: 'bg-red-500 hover:bg-red-600 border-red-500 text-white',
            border: 'border-red-500',
        },
        warning: {
            icon: <AlertCircle size={32} className="text-yellow-500" />,
            bg: 'bg-accent-50',
            button: 'bg-accent hover:bg-accent-dark border-accent text-black',
            border: 'border-accent',
        },
        info: {
            icon: <Info size={32} className="text-blue-500" />,
            bg: 'bg-blue-50',
            button: 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white',
            border: 'border-blue-500',
        },
    };

    const currentStyle = styles[type] || styles.danger;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
                onClick={closeConfirmation}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-in zoom-in-95 swing-in-top-fwd duration-300">
                <div className={`w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${currentStyle.bg}`}>
                    {currentStyle.icon}
                </div>

                <h3 className="text-2xl font-black mb-2 leading-tight">{title}</h3>
                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={closeConfirmation}
                        className="flex-1 py-3 px-4 bg-white border-2 border-black rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 py-3 px-4 border-2 border-black rounded-xl font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none ${currentStyle.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
