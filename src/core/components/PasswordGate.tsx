import React, { useState, useRef } from 'react';
import { Button, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Lock } from 'lucide-react';

// @ts-expect-error - __APP_VERSION__ is injected by Vite during build
const APP_VERSION = __APP_VERSION__;

const HARDCODED_PIN = '2050';

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const handleUnlock = (currentDigits = digits) => {
    if (currentDigits.join('') === HARDCODED_PIN) {
      setUnlocked(true);
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

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 animate-content-enter">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center bg-primary text-primary-foreground">
            <Lock className="size-4" />
          </div>
          Anaesthetic Allergy Clinic
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Enter your PIN to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 items-center">
                <Label>PIN</Label>
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
                      className="w-12 h-14 text-center text-xl border border-input bg-background
                                 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                                 transition-colors"
                    />
                  ))}
                </div>
              </div>
              {error && <p className="text-destructive text-sm text-center">{error}</p>}
              <Button onClick={() => handleUnlock()} className="w-full">Unlock</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>RPAH Department of Clinical Immunology &amp; Allergy</span>
          <span className="font-mono">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;
