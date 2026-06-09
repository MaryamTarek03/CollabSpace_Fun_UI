import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Wrapper Component
 * Provides consistent modal styling with backdrop, animations, and close handling.
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Close handler
 * @param {string} size - Modal size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {string} zLevel - Z-index level: 'low' (50) | 'medium' (70) | 'high' (90) | 'highest' (100)
 * @param {boolean} showCloseButton - Whether to show X button in corner
 * @param {string} className - Additional classes for modal content
 * @param {React.ReactNode} children - Modal content
 */
export default function ModalWrapper({
    isOpen,
    onClose,
    size = 'md',
    zLevel = 'medium',
    showCloseButton = false,
    className = '',
    children
}) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-3xl',
        full: 'max-w-[95vw] max-h-[95vh]'
    };

    const zIndexClasses = {
        low: 'z-50',
        medium: 'z-[70]',
        high: 'z-[90]',
        highest: 'z-[100]'
    };

    return (
        <div className={`fixed inset-0 ${zIndexClasses[zLevel]} flex items-center justify-center p-4`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full ${sizeClasses[size]} bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 overflow-hidden ${className}`}>
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none z-10"
                    >
                        <X size={20} />
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}
