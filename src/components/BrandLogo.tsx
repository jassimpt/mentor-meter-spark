import { cn } from "@/lib/utils";

interface BrandLogoProps {
    className?: string;
}

export const BrandLogo = ({ className }: BrandLogoProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-in fade-in zoom-in duration-500", className)}
        >
            {/* Outer abstract Hexagon/Meter frame */}
            <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                className="opacity-30"
            />
            {/* Inner spark representing energy and tracking */}
            <path
                d="M13 6 7 13h5l-1.5 5.5L17 11h-5l1.5-5z"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
};
