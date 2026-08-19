import React from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { Activity, FileInput, Plus, X } from 'lucide-react';
import { TryptaseData } from '@shared/types';
import { EMPTY_TRYPTASE } from './TestingLogFormSectionShared';

export interface TryptaseSectionProps {
  tryptase?: TryptaseData;
  onChange: (tryptase: TryptaseData) => void;
}

export function TryptaseSection({ tryptase, onChange }: TryptaseSectionProps) {
  return (
    <Card style={{ '--section-index': 3 } as React.CSSProperties} className="animate-section-reveal">
      <CardHeader bordered>
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <div className="bg-muted p-1.5 rounded-none">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          Serial Serum Tryptase
          {tryptase?.source === 'referral' && (
            <Badge variant="outline" className="ml-auto gap-1 text-xs font-normal normal-case tracking-normal text-muted-foreground rounded-none">
              <FileInput className="h-3 w-3" aria-hidden="true" />
              Imported from referral — verify
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={tryptase?.obtained ?? false}
            aria-label="Tryptase samples obtained"
            onClick={() => onChange({
              ...(tryptase ?? EMPTY_TRYPTASE),
              obtained: !(tryptase?.obtained ?? false),
            })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              tryptase?.obtained ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-none bg-background shadow-sm transform transition-transform ${tryptase?.obtained ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <Label className="text-foreground">Tryptase samples obtained</Label>
        </div>

        {tryptase?.obtained && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={tryptase.significantElevation}
                aria-label="Clinically significant dynamic elevation"
                onClick={() => onChange({
                  ...(tryptase ?? EMPTY_TRYPTASE),
                  significantElevation: !(tryptase ?? EMPTY_TRYPTASE).significantElevation,
                  source: 'entered',
                })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tryptase.significantElevation ? 'bg-status-danger' : 'bg-muted'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-none bg-background shadow-sm transform transition-transform ${tryptase.significantElevation ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <Label className={tryptase.significantElevation ? 'text-status-danger font-semibold' : 'text-foreground'}>
                Clinically significant dynamic elevation
              </Label>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Sample Values <span className="normal-case">(μg/L)</span></Label>
              {(tryptase.values.length === 0 ? [{ time: '', result: '' }] : tryptase.values).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4 shrink-0 font-mono">T{idx + 1}</span>
                    <Input
                      placeholder="Time (e.g. 15:30)"
                      className="h-9 rounded-none text-sm font-mono tabular-nums bg-background"
                      value={tryptase?.values[idx]?.time ?? ''}
                      onChange={e => {
                        const vals = [...(tryptase?.values ?? [])];
                        while (vals.length <= idx) vals.push({ time: '', result: '' });
                        vals[idx] = { ...vals[idx], time: e.target.value };
                        onChange({ ...(tryptase ?? EMPTY_TRYPTASE), values: vals, source: 'entered' });
                      }}
                    />
                    <Input
                      placeholder="Result"
                      className="h-9 rounded-none text-sm w-28 font-mono tabular-nums bg-background"
                      value={tryptase?.values[idx]?.result ?? ''}
                      onChange={e => {
                        const vals = [...(tryptase?.values ?? [])];
                        while (vals.length <= idx) vals.push({ time: '', result: '' });
                        vals[idx] = { ...vals[idx], result: e.target.value };
                        onChange({ ...(tryptase ?? EMPTY_TRYPTASE), values: vals, source: 'entered' });
                      }}
                    />
                  </div>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const vals = (tryptase?.values ?? []).filter((_, i) => i !== idx);
                        onChange({ ...(tryptase ?? EMPTY_TRYPTASE), values: vals, source: 'entered' });
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
                      aria-label={`Remove sample T${idx + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {tryptase.values.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 rounded-none font-normal text-muted-foreground hover:text-foreground"
                  onClick={() => onChange({
                    ...(tryptase ?? EMPTY_TRYPTASE),
                    values: [...(tryptase ?? EMPTY_TRYPTASE).values, { time: '', result: '' }],
                    source: 'entered',
                  })}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add sample
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
