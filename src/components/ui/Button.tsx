import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-green-600 text-white hover:bg-green-700",
        secondary: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-green-500",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500",
    };

    return (
        <button
            className={cn("px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50", variants[variant], className)}
            {...props}
        />
    );
};