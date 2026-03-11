import React from 'react';

export const HoverCard = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative group inline-block ${className || ''}`} {...props}>{children}</div>
);

export const HoverCardTrigger = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`cursor-help ${className || ''}`} {...props}>{children}</div>
);

export const HoverCardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2 bg-slate-800 text-slate-100 text-[10px] rounded-none shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center leading-tight ${className || ''}`} {...props}>
    {children}
    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
  </div>
);
