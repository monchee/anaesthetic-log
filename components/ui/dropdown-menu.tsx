import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  return (
    <button
      ref={context.triggerRef}
      onClick={() => context.setOpen(!context.open)}
      className="inline-flex transition-transform duration-200 active:scale-95"
    >
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  const contentRef = useRef<HTMLDivElement>(null);
  const [animationPhase, setAnimationPhase] = React.useState<'entering' | 'entered' | 'exiting'>('entering');

  useEffect(() => {
    if (!context.open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        context.triggerRef.current &&
        !context.triggerRef.current.contains(event.target as Node)
      ) {
        context.setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [context]);

  useEffect(() => {
    if (context.open) {
      setAnimationPhase('entering');
      const timer = setTimeout(() => setAnimationPhase('entered'), 150);
      return () => clearTimeout(timer);
    }
  }, [context.open]);

  if (!context.open) return null;

  // Calculate position to prevent overflow
  const getPosition = () => {
    if (!context.triggerRef.current) return { top: 0, left: 0 };

    const triggerRect = context.triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const estimatedMenuWidth = 224; // w-56 = 14rem = 224px

    const top = triggerRect.bottom + 8 + window.scrollY;
    let left = triggerRect.left + window.scrollX;

    // If menu would overflow the right edge, align it to the right
    if (left + estimatedMenuWidth > viewportWidth) {
      left = viewportWidth - estimatedMenuWidth - 16; // 16px padding from edge
    }

    // Ensure menu doesn't go off the left edge
    if (left < 8) {
      left = 8;
    }

    return { top, left };
  };

  const position = getPosition();

  const animationClass = animationPhase === 'entering'
    ? 'animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-150'
    : '';

  return createPortal(
    <div
      ref={contentRef}
      className={`absolute z-50 min-w-[12rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 ${className || ''} ${animationClass}`}
      style={{
        top: position.top,
        left: position.left,
        transformOrigin: 'top center',
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export const DropdownMenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    context?.setOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50 hover:pl-3 ${className || ''}`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC = () => {
  return <div className="-mx-1 my-1 h-px bg-slate-200 dark:bg-slate-800" />;
};
