import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
