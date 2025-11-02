
"use client";

import { useEffect } from 'react';

type LoaderProps = {
  onFinished?: () => void;
};

export function Loader({ onFinished }: LoaderProps) {

  useEffect(() => {
    const timer = setTimeout(() => {
      if(onFinished) onFinished();
    }, 1800); // Should be slightly less than the layout's timeout
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24">
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="animate-pulse-and-draw"
                >
                    <style>
                        {`
                            @keyframes draw {
                                0% { stroke-dashoffset: 200; }
                                80% { stroke-dashoffset: 0; }
                                100% { stroke-dashoffset: 0; }
                            }
                            @keyframes pulse {
                                0%, 100% { transform: scale(1); opacity: 1; }
                                50% { transform: scale(1.05); opacity: 0.8; }
                            }
                            .animate-pulse-and-draw path, .animate-pulse-and-draw polyline, .animate-pulse-and-draw line {
                                stroke-dasharray: 200;
                                stroke-dashoffset: 200;
                                animation: draw 2s ease-in-out forwards, pulse 2.5s infinite ease-in-out;
                                transform-origin: center;
                            }
                        `}
                    </style>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-[0.2em] text-primary" aria-label="OrganizaS">
                <span className="animate-fade-in-letter" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>O</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>r</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>g</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>a</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>n</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>i</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '800ms', animationFillMode: 'both' }}>z</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '900ms', animationFillMode: 'both' }}>a</span>
                <span className="animate-fade-in-letter" style={{ animationDelay: '1000ms', animationFillMode: 'both' }}>S</span>
            </h1>
             <style>
                {`
                    @keyframes fade-in-letter {
                        0% {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-fade-in-letter {
                        display: inline-block;
                        opacity: 0;
                        animation: fade-in-letter 0.5s ease-out;
                    }
                `}
            </style>
        </div>
    </div>
  );
}
