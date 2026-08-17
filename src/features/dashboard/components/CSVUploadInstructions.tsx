import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui';
import { FileUp } from 'lucide-react';
import { RedcapExportSteps } from './RedcapExportSteps';

interface CSVUploadInstructionsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const CSVUploadInstructions: React.FC<CSVUploadInstructionsProps> = ({
  isOpen,
  onOpenChange,
  onUpload,
  isUploading
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="rounded-none border-l border-border">
        <SheetHeader className="mb-6 pt-12">
          <SheetTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5 text-primary" />
            Update Database
          </SheetTitle>
          <SheetDescription>
            Instructions for exporting patient data from REDCap and importing it here.
          </SheetDescription>
        </SheetHeader>

        <RedcapExportSteps onUpload={onUpload} isUploading={isUploading} />
      </SheetContent>
    </Sheet>
  );
};

export default React.memo(CSVUploadInstructions);
