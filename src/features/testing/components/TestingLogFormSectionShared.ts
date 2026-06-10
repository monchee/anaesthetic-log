import React from 'react';
import { LogFormData } from '@/types';

export const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault();
};

export const EMPTY_TRYPTASE: NonNullable<LogFormData['tryptase']> = {
  obtained: false,
  significantElevation: false,
  values: [],
};

export type InputChangeHandler = (field: keyof LogFormData, value: LogFormData[keyof LogFormData]) => void;
