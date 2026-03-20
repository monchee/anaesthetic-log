import React, { useState } from 'react';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';
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
    if (e.key === 'Enter') handleUnlock();
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="pt-8 pb-8 px-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 dark:bg-primary/20 flex items-center justify-center rounded-none">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Anaesthetic Allergy Clinic
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your PIN to continue
            </p>
          </div>

          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase text-slate-500">PIN</Label>
              <div className="relative">
                <Input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter PIN..."
                  autoFocus
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-600 text-xs font-medium">{error}</p>}
            <Button onClick={handleUnlock} className="w-full" size="lg">Unlock</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGate;
