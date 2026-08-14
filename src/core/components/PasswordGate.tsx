import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

const APP_VERSION = __APP_VERSION__;

const HARDCODED_PIN = '2050';
const UNLOCK_KEY = 'dream:unlocked';

function getStoredUnlock(): boolean {
  try { return sessionStorage.getItem(UNLOCK_KEY) === 'true'; }
  catch { return false; }
}

function setStoredUnlock(val: boolean) {
  try { if (val) sessionStorage.setItem(UNLOCK_KEY, 'true'); else sessionStorage.removeItem(UNLOCK_KEY); }
  catch { /* Safari private mode */ }
}

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(getStoredUnlock);
  const [isExiting, setIsExiting] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    if (unlocked) setStoredUnlock(true);
  }, [unlocked]);

  const handleUnlock = (currentDigits = digits) => {
    if (currentDigits.join('') === HARDCODED_PIN) {
      setIsExiting(true);
      setTimeout(() => setUnlocked(true), 300);
    } else {
      setError('Incorrect PIN');
      setDigits(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (digit && index === 3) {
      handleUnlock(next);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUnlock();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (!pasted) return;
    const next = ['', '', '', ''];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setDigits(next);
    setError('');
    if (pasted.length === 4) {
      handleUnlock(next);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  if (unlocked) return <div className="animate-screen-enter">{children}</div>;

  return (
    <main className={`flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 ${isExiting ? 'animate-gate-exit pointer-events-none' : ''}`} aria-label="Screen lock">
      <div className="flex w-full max-w-sm flex-col gap-6 animate-content-enter">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="app-wordmark text-5xl font-bold text-primary">DREAM</h1>
          <p className="text-xs tracking-wider text-muted-foreground">Drug Reaction Evaluation &amp; Anaesthetic Management</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold tracking-tight">Screen Lock</CardTitle>
            <CardDescription>Enter PIN to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 items-center">
                <div className="flex gap-3" role="group" aria-label="PIN entry">
                  {[0, 1, 2, 3].map(i => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digits[i]}
                      autoFocus={i === 0}
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      aria-label={`PIN digit ${i + 1} of 4`}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl text-foreground border border-input bg-background rounded-none
                                 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                                 transition-colors"
                    />
                  ))}
                </div>
              </div>
              {error && <p role="alert" className="text-destructive text-sm text-center">{error}</p>}
              <Button onClick={() => handleUnlock()} className="w-full">Unlock</Button>
              <p className="text-xs text-muted-foreground text-center leading-tight">
                This is a screen lock to prevent shoulder-surfing on shared workstations. Patient data security is governed separately by the database access controls.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs tracking-wide text-muted-foreground text-center">
          <span>RPAH Department of Clinical Immunology &amp; Allergy</span>
        </div>
      </div>
      <span className="fixed bottom-4 right-4 md:bottom-6 md:right-6 text-xs font-mono text-muted-foreground">v{APP_VERSION}</span>
    </main>
  );
};

export default PasswordGate;
