import React, { createContext, useContext, useState } from 'react';

interface RedactContextValue {
  isRedacted: boolean;
  toggleRedact: () => void;
  redact: (value: string) => string;
}

const RedactContext = createContext<RedactContextValue>({
  isRedacted: false, toggleRedact: () => {}, redact: (v) => v,
});

export function useRedact() { return useContext(RedactContext); }

export function RedactProvider({ children }: { children: React.ReactNode }) {
  const [isRedacted, setIsRedacted] = useState(false);
  const toggleRedact = () => setIsRedacted(prev => !prev);
  const redact = (value: string) => isRedacted ? '———' : value;
  return (
    <RedactContext.Provider value={{ isRedacted, toggleRedact, redact }}>
      {children}
    </RedactContext.Provider>
  );
}
