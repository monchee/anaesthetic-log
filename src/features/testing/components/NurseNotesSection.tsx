import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { LogFormData } from '@/types';

interface NurseNotesSectionProps {
  formData: LogFormData;
  setFormData: React.Dispatch<React.SetStateAction<LogFormData>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NurseNotesSection({ formData, setFormData, isOpen, setIsOpen }: NurseNotesSectionProps) {
  return (
    <Card style={{ '--section-index': 5 } as React.CSSProperties} className="animate-section-reveal rounded-none border-blue-200 dark:border-blue-900/40">
      <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-900/30">
        <button type="button" className="flex items-center justify-between w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-none p-0.5" onClick={() => setIsOpen(open => !open)}>
          <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-none">
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            Nursing Notes
            <span className="text-xs font-normal text-muted-foreground ml-1">(nursing team only)</span>
          </CardTitle>
          {isOpen ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
        </button>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-6 space-y-5">
          {([
            ['preTesting', 'nurse-pre', 'Pre-Testing Observations', 'e.g. consent obtained, vitals stable, IV access established...'],
            ['duringTesting', 'nurse-during', 'During Testing', 'e.g. patient tolerated well, no adverse events observed...'],
            ['postTesting', 'nurse-post', 'Post-Testing / Discharge', 'e.g. patient discharged in stable condition, instructions given...'],
          ] as const).map(([field, id, label, placeholder]) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={id} className="text-blue-800 dark:text-blue-300 font-medium">{label}</Label>
              <textarea
                id={id}
                className="flex min-h-[80px] w-full rounded-none border border-blue-200 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-blue-900/40 dark:bg-background"
                placeholder={placeholder}
                value={formData.nurseNotes?.[field] || ''}
                onChange={e => setFormData(prev => ({ ...prev, nurseNotes: { ...prev.nurseNotes, [field]: e.target.value } }))}
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="nurse-signed" className="text-blue-800 dark:text-blue-300 font-medium">Signed by (RN)</Label>
            <Input
              id="nurse-signed"
              className="border-blue-200 dark:border-blue-900/40 focus:ring-blue-400 rounded-none bg-background text-foreground"
              placeholder="Nurse name..."
              value={formData.nurseNotes?.signedBy || ''}
              onChange={e => setFormData(prev => ({ ...prev, nurseNotes: { ...prev.nurseNotes, signedBy: e.target.value } }))}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
