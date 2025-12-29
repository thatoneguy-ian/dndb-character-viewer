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
        primary: "bg-[var(--color-action)] hover:brightness-110 text-white shadow-lg shadow-black/10",
        secondary: "bg-[var(--bg-input)] hover:bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--border-color)]",
        danger: "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-[var(--color-danger)] border border-red-200 dark:border-red-500/50",
        ghost: "bg-transparent hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
        onKeyDown={(e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
            }
        }}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={`bg-[var(--bg-card)] backdrop-blur-sm border border-[var(--border-color)] rounded-lg overflow-hidden transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-[var(--text-secondary)]/50 hover:bg-[var(--bg-app)]/50 shadow-md shadow-black/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-action)]' : 'shadow-sm shadow-black/5'} ${className}`}
    >
        {children}
    </div>
);

// --- BADGE ---
export const Badge: React.FC<{
    children: React.ReactNode;
    color?: 'red' | 'blue' | 'green' | 'gray' | 'yellow';
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}> = ({
    children,
    color = 'gray',
    className = '',
    onClick
}) => {
        const colors = {
            red: "bg-red-50 text-[var(--color-danger)] border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-500/30",
            blue: "bg-blue-50 text-[#172B4D] dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
            green: "bg-green-50 text-[var(--text-success)] border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-500/30",
            gray: "bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-color)]",
            yellow: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-500/30"
        };

        return (
            <div
                onClick={onClick}
                onKeyDown={(e) => {
                    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onClick(e as any);
                    }
                }}
                role={onClick ? "button" : undefined}
                tabIndex={onClick ? 0 : undefined}
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${colors[color]} ${onClick ? 'cursor-pointer hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-action)]' : ''} ${className}`}
            >
                {children}
            </div>
        );
    };

// --- ICON BUTTON ---
export const IconButton: React.FC<ButtonProps & { title?: string }> = ({
    children,
    className = '',
    title,
    ...props
}) => (
    <button
        className={`p-2 rounded-full transition-all duration-200 
            text-[var(--text-secondary)] 
            hover:text-[var(--text-primary)] 
            hover:bg-[var(--bg-input)] ${className}`}
        title={title}
        aria-label={title || props['aria-label']}
        {...props}
    >
        {children}
    </button>
);
