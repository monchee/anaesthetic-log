
import React, { useState, createContext, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { Toaster as HotToaster } from "react-hot-toast"

// --- Toaster (React Hot Toast) ---
export const Toaster = () => {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        zIndex: 100000, // Ensure it's above everything
      }}
      toastOptions={{
        duration: 5000,
        className: 'dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg text-sm font-medium',
        style: {
          padding: '12px 16px',
          maxWidth: '500px',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981', // Emerald-500
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #10b981',
          }
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#ef4444', // Red-500
            secondary: '#ffffff',
          },
          style: {
            borderLeft: '4px solid #ef4444',
          }
        },
      }}
    />
  )
}

// --- Card ---
export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>
    {children}
  </div>
);

export const CardTitle = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h3>
);

export const CardContent = ({ className, children }: { className?: string, children?: React.ReactNode }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

// --- Inputs & Labels ---
export const Label = ({ className, children, htmlFor }: { className?: string, children?: React.ReactNode, htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300 ${className || ''}`}>
    {children}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 ${className || ''}`}
    {...props}
  />
));
Input.displayName = "Input";

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "headerAction";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  const variants = {
    default: "bg-[#8055f1] hover:bg-[#6b42d1] text-white shadow dark:bg-[#8055f1] dark:hover:bg-[#9975f3] dark:text-white",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-900/90",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
    secondary: "bg-[#e6e1fd] text-[#441170] hover:bg-[#d6cffb] dark:bg-[#441170] dark:text-[#e6e1fd] dark:hover:bg-[#330d54]",
    ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
    link: "text-[#8055f1] underline-offset-4 hover:underline dark:text-purple-400",
    headerAction: "bg-white text-[#441170] hover:bg-slate-100 shadow-sm border border-transparent dark:bg-slate-900 dark:text-purple-300 dark:border-slate-700 dark:hover:bg-slate-800",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// --- Badge ---
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "danger" | "grade4" | "grade3" | "grade2" | "grade1" | "ungraded";
  className?: string;
  children?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    destructive: "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
    outline: "text-slate-950 dark:text-slate-50",
    success: "border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-600",
    danger: "border-transparent bg-red-500 text-white hover:bg-red-600 dark:bg-red-600",
    grade4: "border-transparent bg-red-600 text-white hover:bg-red-700",
    grade3: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
    grade2: "border-transparent bg-amber-400 text-black hover:bg-amber-500",
    grade1: "border-transparent bg-blue-400 text-white hover:bg-blue-500",
    ungraded: "border-transparent bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300",
  };

  return (
    <div ref={ref} className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-slate-300 ${variants[variant]} ${className || ''}`} {...props} />
  );
});
Badge.displayName = "Badge";

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: string[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, options, placeholder, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 ${className || ''}`}
      {...props}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options ? options.map(opt => <option key={opt} value={opt}>{opt}</option>) : children}
    </select>
    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
  </div>
));
Select.displayName = "Select";

// --- AccordionItem ---
interface AccordionItemProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem = ({ title, children, defaultOpen = false, className }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-slate-200 dark:border-slate-800 last:border-0 ${className || ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-1 items-center justify-between py-4 px-5 font-medium transition-all w-full text-left"
      >
        {title}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

// --- HoverCard ---
export const HoverCard = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative group inline-block ${className || ''}`} {...props}>{children}</div>
);

export const HoverCardTrigger = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`cursor-help ${className || ''}`} {...props}>{children}</div>
);

export const HoverCardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2 bg-slate-800 text-slate-100 text-[10px] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center leading-tight ${className || ''}`} {...props}>
    {children}
    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
  </div>
);

// --- Dialog ---
export const Dialog = ({ open, onOpenChange, children, className }: { open: boolean; onOpenChange: (open: boolean) => void; children?: React.ReactNode; className?: string }) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Focus trap implementation
  React.useEffect(() => {
    if (open && dialogRef.current) {
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      firstElement?.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab' && focusableElements) {
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onOpenChange(false);
        }
      };

      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onOpenChange]);

  if (!open) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-center justify-center p-4"
    >
      <div
        ref={dialogRef}
         className={`relative w-full gap-4 border bg-white p-6 shadow-lg duration-200 rounded-lg dark:bg-slate-950 dark:border-slate-800 max-w-lg ${className || ''}`}
         onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500 dark:ring-offset-slate-950 dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-400"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="fixed inset-0 -z-10" onClick={() => onOpenChange(false)} aria-hidden="true" />
    </div>,
    document.body
  );
};

export const DialogContent = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
    <div className={className}>{children}</div>
);

export const DialogHeader = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}>
    {children}
  </div>
);

export const DialogTitle = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  const titleId = React.useId();
  return (
    <h2 id={titleId} className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>
      {children}
    </h2>
  );
};

export const DialogFooter = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}>
    {children}
  </div>
);

// --- Sheet ---
const ANIMATION_DURATION = 300; // ms

type SheetContextType = { 
  open: boolean; 
  setOpen: (open: boolean) => void;
};
const SheetContext = createContext<SheetContextType | null>(null);

export const Sheet = ({ children, open, onOpenChange }: { children?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Controlled vs Uncontrolled logic
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const setOpenState = isControlled ? onOpenChange : setInternalOpen;

  const handleSetOpen = (newOpen: boolean) => {
    if (setOpenState) {
        setOpenState(newOpen);
    }
  };

  return (
    <SheetContext.Provider value={{ open: !!currentOpen, setOpen: handleSetOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

export const SheetTrigger = ({ children }: { children?: React.ReactNode }) => {
  const context = useContext(SheetContext);
  if (!context) throw new Error("SheetTrigger must be used within Sheet");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      context.setOpen(true);
    }
  };

  return (
    <div
      onClick={() => context.setOpen(true)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Open sheet"
      className="inline-block cursor-pointer"
    >
      {children}
    </div>
  );
};

export const SheetContent = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
  const context = useContext(SheetContext);
  if (!context) throw new Error("SheetContent must be used within Sheet");
  
  const { open, setOpen } = context;
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    if (open) {
      setShouldRender(true);
    } else if (shouldRender) {
      // If open becomes false but we are currently rendering,
      // wait for animation to finish before unmounting
      timeoutId = window.setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);
    }
    return () => {
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  // If we are rendering but open is false, we are animating out
  const animationClass = open ? 'animate-sheet-in' : 'animate-sheet-out';
  const backdropOpacity = open ? 'opacity-100' : 'opacity-0';

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
       {/* Backdrop */}
       <div 
         className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${backdropOpacity}`} 
         onClick={() => setOpen(false)} 
       />
       
       {/* Panel */}
       <div 
         className={`relative z-50 h-full w-full max-w-sm bg-white p-6 shadow-xl dark:bg-slate-950 dark:border-l dark:border-slate-800 sm:max-w-md 
            ${className || ''} ${animationClass} `}
       >
          <button 
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500 dark:ring-offset-slate-950 dark:focus:ring-slate-300 dark:data-[state=open]:bg-slate-800 dark:data-[state=open]:text-slate-400"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
       </div>
    </div>,
    document.body
  );
};

export const SheetHeader = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left ${className || ''}`}>
    {children}
  </div>
);

export const SheetTitle = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <h2 className={`text-lg font-semibold text-slate-950 dark:text-slate-50 ${className || ''}`}>
    {children}
  </h2>
);

export const SheetDescription = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <p className={`text-sm text-slate-500 dark:text-slate-400 ${className || ''}`}>
    {children}
  </p>
);

// --- DropdownMenu ---
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu';
