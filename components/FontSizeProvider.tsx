import React, { createContext, useContext, useEffect, useState } from "react";

interface FontSizeProviderProps {
  children?: React.ReactNode;
}

interface FontSizeProviderState {
  fontSizePercent: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const FontSizeContext = createContext<FontSizeProviderState | undefined>(undefined);

const MIN_SIZE = 85;
const MAX_SIZE = 125;
const STEP = 5;

export function FontSizeProvider({ children }: FontSizeProviderProps) {
  const [fontSizePercent, setFontSizePercent] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app-font-size-pct");
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${fontSizePercent}%`;
    localStorage.setItem("app-font-size-pct", fontSizePercent.toString());
  }, [fontSizePercent]);

  const increaseFontSize = () => {
    setFontSizePercent((prev) => Math.min(prev + STEP, MAX_SIZE));
  };

  const decreaseFontSize = () => {
    setFontSizePercent((prev) => Math.max(prev - STEP, MIN_SIZE));
  };

  const resetFontSize = () => {
    setFontSizePercent(100);
  };

  return (
    <FontSizeContext.Provider value={{ 
        fontSizePercent, 
        increaseFontSize, 
        decreaseFontSize, 
        resetFontSize,
        canIncrease: fontSizePercent < MAX_SIZE,
        canDecrease: fontSizePercent > MIN_SIZE
    }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined)
    throw new Error("useFontSize must be used within a FontSizeProvider");
  return context;
};