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
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Label className="whitespace-nowrap text-base font-semibold text-[#441170] dark:text-purple-300 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Visit Date:
          </Label>
          <Input 
            type="date" 
            className="max-w-[200px] font-mono"
            value={visitDate}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
