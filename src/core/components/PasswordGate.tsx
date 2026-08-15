import React, { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle, KeyRound } from 'lucide-react';
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
    <main
      className={`relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10 ${
        isExiting ? 'animate-gate-exit pointer-events-none' : ''
      }`}
      aria-label="Screen lock"
    >
      {/* Decorative ambient background light fields */}
      <div className="ambient-light-field-1" aria-hidden="true" />
      <div className="ambient-light-field-2" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6 animate-content-enter">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="app-wordmark text-4xl sm:text-5xl font-bold text-primary">DREAM</h1>
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Drug Reaction Evaluation &amp; Anaesthetic Management
          </p>
        </div>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="text-center pb-4 sm:pb-5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              <Lock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>Clinical Workstation</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-primary dark:text-foreground">
              Screen Lock
            </CardTitle>
            <CardDescription id="pin-instructions" className="text-sm text-muted-foreground">
              Enter PIN to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 items-center">
                <div
                  className="flex gap-2.5 sm:gap-3"
                  role="group"
                  aria-label="PIN entry"
                  aria-describedby="pin-instructions pin-status"
                >
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
                      aria-describedby="pin-instructions pin-status"
                      aria-invalid={error ? 'true' : 'false'}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      className={`w-12 h-14 sm:w-14 sm:h-14 text-center text-2xl font-mono rounded-none border transition-colors ${
                        error
                          ? 'border-destructive text-destructive bg-destructive/5 focus:outline-none focus:ring-2 focus:ring-destructive focus:border-destructive'
                          : digits[i]
                            ? 'border-primary/60 bg-primary/[0.03] text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring'
                            : 'border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {error ? (
                <div
                  id="pin-status"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center justify-center gap-1.5 text-destructive text-sm font-medium text-center"
                >
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              ) : (
                <div id="pin-status" role="status" aria-live="polite" className="sr-only">
                  <span>Screen locked. Enter 4-digit PIN.</span>
                </div>
              )}

              <Button
                type="button"
                onClick={() => handleUnlock()}
                className="w-full h-11 text-sm font-semibold rounded-none btn-press"
              >
                <KeyRound className="size-4 shrink-0" aria-hidden="true" />
                Unlock
              </Button>

              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                This is a screen lock to prevent shoulder-surfing on shared workstations. Patient data security is governed separately by the database access controls.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs tracking-wide text-muted-foreground text-center">
          <span>RPAH Department of Clinical Immunology &amp; Allergy</span>
        </div>
      </div>
      <span className="fixed bottom-4 right-4 md:bottom-6 md:right-6 text-xs font-mono text-muted-foreground">
        v{APP_VERSION}
      </span>
    </main>
  );
};

export default PasswordGate;
