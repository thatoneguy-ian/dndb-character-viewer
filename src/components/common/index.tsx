import React from 'react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20",
        secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700",
        danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-500/50",
        ghost: "bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3 text-base"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
    children,
    className = '',
    onClick
}) => (
    <div
        onClick={onClick}
        className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-gray-500 hover:bg-gray-800/80' : ''} ${className}`}
    >
        {children}
    </div>
);

// --- BADGE ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'red' | 'blue' | 'green' | 'gray' | 'yellow'; className?: string }> = ({
    children,
    color = 'gray',
    className = ''
}) => {
    const colors = {
        red: "bg-red-900/40 text-red-400 border-red-500/30",
        blue: "bg-blue-900/40 text-blue-400 border-blue-500/30",
        green: "bg-green-900/40 text-green-400 border-green-500/30",
        gray: "bg-gray-700/50 text-gray-400 border-gray-600/30",
        yellow: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30"
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${colors[color]} ${className}`}>
            {children}
        </span>
    );
};

// --- ICON BUTTON ---
export const IconButton: React.FC<ButtonProps & { title?: string }> = ({
    children,
    className = '',
    ...props
}) => (
    <button
        className={`p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 ${className}`}
        {...props}
    >
        {children}
    </button>
);
