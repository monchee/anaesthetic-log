import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// --- Card ---
export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className || ''}`} {...props}>
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
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 ${className || ''}`}>
    {children}
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
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
    default: "bg-[#8055f1] hover:bg-[#6b42d1] text-white shadow",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
    secondary: "bg-[#e6e1fd] text-[#441170] hover:bg-[#d6cffb]",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-[#8055f1] underline-offset-4 hover:underline",
    headerAction: "bg-white text-[#441170] hover:bg-slate-100 shadow-sm",
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
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// --- Select ---
export const Select = ({ options, placeholder, value, onChange, className }: { options: string[], placeholder: string, value: any, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, className?: string }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className || ''}`}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  </div>
);

// --- Badge ---
interface BadgeProps {
  variant?: "default" | "success" | "danger" | "warning" | "outline";
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", children, className }) => {
  const styles = {
    default: "border-transparent bg-[#8055f1] text-white hover:bg-[#8055f1]/80",
    success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
    danger: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
    warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    outline: "text-slate-950 border border-slate-200",
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${styles[variant]} ${className || ''}`}>
      {children}
    </div>
  );
};

// --- Accordion ---
interface AccordionItemProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const AccordionItem = ({ title, children, defaultOpen = false, className }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-slate-200 last:border-0 ${className || ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 px-6 font-medium transition-all hover:underline"
      >
        <div className="flex-1 text-left pr-4">
            {title}
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-0">{children}</div>
      </div>
    </div>
  );
};