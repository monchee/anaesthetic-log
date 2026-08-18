import React from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { Activity, FileInput, Plus, X } from 'lucide-react';
import { LogFormData } from '@shared/types';
import { EMPTY_TRYPTASE } from './TestingLogFormSectionShared';

interface TryptaseSectionProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
}

export function TryptaseSection({ formData, setFormData }: TryptaseSectionProps) {
  return (
    <Card style={{ '--section-index': 3 } as React.CSSProperties} className="animate-section-reveal rounded-none">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <div className="bg-muted p-1.5 rounded-none">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          Serial Serum Tryptase
          {formData.tryptase?.source === 'referral' && (
            <Badge variant="outline" className="ml-auto gap-1 text-xs font-normal normal-case tracking-normal text-muted-foreground rounded-none">
              <FileInput className="h-3 w-3" aria-hidden="true" />
              Imported from referral — verify
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={formData.tryptase?.obtained ?? false}
            aria-label="Tryptase samples obtained"
            onClick={() => setFormData(prev => ({
              ...prev,
              tryptase: {
                ...(prev.tryptase ?? EMPTY_TRYPTASE),
                obtained: !(prev.tryptase?.obtained ?? false),
              },
            }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              formData.tryptase?.obtained ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 rounded-none bg-background shadow-sm transform transition-transform ${formData.tryptase?.obtained ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <Label className="text-foreground">Tryptase samples obtained</Label>
        </div>

        {formData.tryptase?.obtained && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={formData.tryptase.significantElevation}
                aria-label="Clinically significant dynamic elevation"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  tryptase: {
                    ...(prev.tryptase ?? EMPTY_TRYPTASE),
                    significantElevation: !(prev.tryptase ?? EMPTY_TRYPTASE).significantElevation,
                    source: 'entered',
                  },
                }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  formData.tryptase.significantElevation ? 'bg-status-danger' : 'bg-muted'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-none bg-background shadow-sm transform transition-transform ${formData.tryptase.significantElevation ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <Label className={formData.tryptase.significantElevation ? 'text-status-danger font-semibold' : 'text-foreground'}>
                Clinically significant dynamic elevation
              </Label>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Sample Values (μg/L)</Label>
              {(formData.tryptase.values.length === 0 ? [{ time: '', result: '' }] : formData.tryptase.values).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-4 shrink-0 font-mono">T{idx + 1}</span>
                    <Input
                      placeholder="Time (e.g. 15:30)"
                      className="h-9 rounded-none text-sm font-mono tabular-nums bg-background"
                      value={formData.tryptase?.values[idx]?.time ?? ''}
                      onChange={e => {
                        const vals = [...(formData.tryptase?.values ?? [])];
                        while (vals.length <= idx) vals.push({ time: '', result: '' });
                        vals[idx] = { ...vals[idx], time: e.target.value };
                        setFormData(prev => ({ ...prev, tryptase: { ...(prev.tryptase ?? EMPTY_TRYPTASE), values: vals, source: 'entered' } }));
                      }}
                    />
                    <Input
                      placeholder="Result"
                      className="h-9 rounded-none text-sm w-28 font-mono tabular-nums bg-background"
                      value={formData.tryptase?.values[idx]?.result ?? ''}
                      onChange={e => {
                        const vals = [...(formData.tryptase?.values ?? [])];
                        while (vals.length <= idx) vals.push({ time: '', result: '' });
                        vals[idx] = { ...vals[idx], result: e.target.value };
                        setFormData(prev => ({ ...prev, tryptase: { ...(prev.tryptase ?? EMPTY_TRYPTASE), values: vals, source: 'entered' } }));
                      }}
                    />
                  </div>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const vals = (formData.tryptase?.values ?? []).filter((_, i) => i !== idx);
                        setFormData(prev => ({ ...prev, tryptase: { ...(prev.tryptase ?? EMPTY_TRYPTASE), values: vals, source: 'entered' } }));
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive"
                      aria-label={`Remove sample T${idx + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {formData.tryptase.values.length < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 rounded-none font-normal text-muted-foreground hover:text-foreground"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    tryptase: {
                      ...(prev.tryptase ?? EMPTY_TRYPTASE),
                      values: [...(prev.tryptase ?? EMPTY_TRYPTASE).values, { time: '', result: '' }],
                      source: 'entered',
                    },
                  }))}
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
