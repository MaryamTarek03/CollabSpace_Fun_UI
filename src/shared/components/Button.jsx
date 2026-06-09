import React from 'react';
import { X } from 'lucide-react';

/**
 * Neobrutalist Button Component
 * Consistent button styling with variants and sizes.
 * 
 * @param {string} variant - Button style: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'
 * @param {string} size - Button size: 'sm' | 'md' | 'lg'
 * @param {boolean} disabled - Disabled state
 * @param {boolean} fullWidth - Full width button
 * @param {React.ReactNode} icon - Icon element (for icon-only or with text)
 * @param {string} className - Additional classes
 * @param {React.ReactNode} children - Button text
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    icon,
    className = '',
    children,
    ...props
}) {
    const baseClasses = 'font-bold border-2 border-black rounded-xl transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';

    const variantClasses = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondary: 'bg-white hover:bg-gray-100 text-black',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white',
        warning: 'bg-accent hover:bg-accent-dark text-black',
        accent: 'bg-accent hover:bg-accent-dark text-black',
        ghost: 'bg-transparent hover:bg-gray-100 text-black border-transparent shadow-none',
        icon: 'bg-white hover:bg-gray-100 text-black'
    };

    const sizeClasses = {
        sm: variant === 'icon' ? 'p-1.5' : 'px-3 py-1.5 text-sm',
        md: variant === 'icon' ? 'p-2' : 'px-4 py-2 text-base',
        lg: variant === 'icon' ? 'p-3' : 'px-6 py-3 text-lg'
    };

    const iconSizes = { sm: 14, md: 18, lg: 22 };

    // Clone icon with appropriate size if provided
    const sizedIcon = icon && React.cloneElement(icon, {
        size: icon.props.size || iconSizes[size]
    });

    return (
        <button
            className={`
                ${baseClasses}
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${fullWidth ? 'w-full' : ''}
                ${variant === 'icon' ? 'flex items-center justify-center' : ''}
                ${icon && children ? 'flex items-center gap-2' : ''}
                ${className}
            `.trim().replace(/\s+/g, ' ')}
            disabled={disabled}
            {...props}
        >
            {sizedIcon}
            {children}
        </button>
    );
}

/**
 * Icon Button - Shorthand for icon-only buttons
 */
export function IconButton({ icon, variant = 'secondary', size = 'md', ...props }) {
    return <Button variant="icon" size={size} icon={icon} {...props} />;
}

/**
 * Close Button - Standard close button for modals
 */
export function CloseButton({ onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${className}`}
        >
            <X size={20} />
        </button>
    );
}

