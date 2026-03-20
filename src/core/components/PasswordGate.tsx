import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Card, CardContent } from '@/components/ui';
import { Lock, KeyRound, Eye, EyeOff } from 'lucide-react';

const STORAGE_KEY = 'app_pin_hash';
const SESSION_KEY = 'app_pin_unlocked';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'rpah-allergy-salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setHasPin(!!stored);
    if (!stored) {
      // No PIN set — app is open
      setUnlocked(true);
    } else {
      // Check session
      const session = sessionStorage.getItem(SESSION_KEY);
      if (session === 'true') setUnlocked(true);
    }
  }, []);

  const handleUnlock = async () => {
    setError('');
    const stored = localStorage.getItem(STORAGE_KEY);
    const hashed = await hashPin(pin);
    if (hashed === stored) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setUnlocked(true);
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleSetup = async () => {
    setError('');
    if (pin.length < 4) {
      setError('PIN must be at least 4 characters');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    const hashed = await hashPin(pin);
    localStorage.setItem(STORAGE_KEY, hashed);
    sessionStorage.setItem(SESSION_KEY, 'true');
    setHasPin(true);
    setUnlocked(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isSettingUp) handleSetup();
      else handleUnlock();
    }
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
              {!hasPin ? 'Set Up PIN' : 'Anaesthetic Allergy Clinic'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {!hasPin ? 'Create a PIN to protect access to patient data' : 'Enter your PIN to continue'}
            </p>
          </div>

          {!hasPin && !isSettingUp ? (
            <div className="space-y-3">
              <Button onClick={() => setIsSettingUp(true)} className="w-full" size="lg">
                <KeyRound className="w-4 h-4 mr-2" /> Set Up PIN
              </Button>
              <Button onClick={() => setUnlocked(true)} variant="ghost" className="w-full text-slate-500" size="sm">
                Skip for now
              </Button>
            </div>
          ) : !hasPin && isSettingUp ? (
            <div className="space-y-4" onKeyDown={handleKeyDown}>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-slate-500">New PIN</Label>
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
              <div className="space-y-1.5">
                <Label className="text-xs uppercase text-slate-500">Confirm PIN</Label>
                <Input
                  type={showPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value)}
                  placeholder="Confirm PIN..."
                />
              </div>
              {error && <p className="text-red-600 text-xs font-medium">{error}</p>}
              <Button onClick={handleSetup} className="w-full" size="lg">Save PIN</Button>
              <Button onClick={() => { setIsSettingUp(false); setPin(''); setConfirmPin(''); setError(''); }} variant="ghost" className="w-full text-slate-500" size="sm">
                Cancel
              </Button>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGate;
