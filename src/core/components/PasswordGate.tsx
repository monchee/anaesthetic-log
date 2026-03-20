import React, { useState } from 'react';
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Lock, Eye, EyeOff } from 'lucide-react';

const HARDCODED_PIN = '2050';

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (pin === HARDCODED_PIN) {
      setUnlocked(true);
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUnlock();
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
            <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pin">PIN</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="Enter PIN..."
                    autoFocus
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button onClick={handleUnlock} className="w-full">Unlock</Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          RPAH Department of Clinical Immunology &amp; Allergy
        </p>
      </div>
    </div>
  );
};

export default PasswordGate;
