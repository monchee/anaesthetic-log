import React from 'react';
import { Card, CardContent, Label, Input } from '../../../../components/ui';
import { Calendar } from 'lucide-react';

interface VisitDetailsSectionProps {
  visitDate: string;
  onChange: (value: string) => void;
}

export const VisitDetailsSection: React.FC<VisitDetailsSectionProps> = ({
  visitDate,
  onChange
}) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <Label htmlFor="visit-date-input" className="whitespace-nowrap text-base font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Visit Date:
          </Label>
          <Input 
            id="visit-date-input"
            type="date" 
            className="max-w-[200px] font-mono tabular-nums rounded-none bg-background text-foreground"
            value={visitDate}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
