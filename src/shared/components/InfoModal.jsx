import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { useUIStore } from '../../store';

export default function InfoModal() {
    const { infoModal, closeInfo } = useUIStore();
    const { isOpen, title, message, type } = infoModal;

    if (!isOpen) return null;

    const styles = {
        error: {
            icon: <AlertTriangle size={32} className="text-red-500" />,
            bg: 'bg-red-50',
            button: 'bg-red-500 hover:bg-red-600 border-red-500 text-white',
        },
        success: {
            icon: <CheckCircle size={32} className="text-green-500" />,
            bg: 'bg-green-50',
            button: 'bg-green-500 hover:bg-green-600 border-green-500 text-white',
        },
        info: {
            icon: <Info size={32} className="text-blue-500" />,
            bg: 'bg-blue-50',
            button: 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white',
        },
    };

    const currentStyle = styles[type] || styles.info;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
                onClick={closeInfo}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 animate-in zoom-in-95 swing-in-top-fwd duration-300">
                {/* Close button */}
                <button
                    onClick={closeInfo}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={18} />
                </button>

                <div className={`w-16 h-16 rounded-2xl border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${currentStyle.bg}`}>
                    {currentStyle.icon}
                </div>

                <h3 className="text-2xl font-black mb-2 leading-tight">{title}</h3>
                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={closeInfo}
                    className={`w-full py-3 px-4 border-2 border-black rounded-xl font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none ${currentStyle.button}`}
                >
                    OK
                </button>
            </div>
        </div>
    );
}
