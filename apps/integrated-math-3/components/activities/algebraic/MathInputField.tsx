'use client';

import React from 'react';
import InlineMath from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';

interface MathInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  correctAnswer?: string;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  showValidation?: boolean;
}

export function MathInputField({
  value,
  onChange,
  label,
  correctAnswer,
  disabled = false,
  error,
  placeholder,
  showValidation = false,
}: MathInputFieldProps) {
  const checkEquivalence = (input: string, answer: string): boolean => {
    const normalizedInput = normalizeExpression(input);
    const normalizedAnswer = normalizeExpression(answer);
    return normalizedInput === normalizedAnswer;
  };

  const normalizeExpression = (expr: string): string => {
    return expr
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\+/g, '+')
      .replace(/-/g, '-')
      .replace(/\*/g, '')
      .replace(/\(\+/g, '(')
      .replace(/\(\-/g, '(-');
  };

  const isValid = showValidation && correctAnswer && value.trim() !== '' 
    ? checkEquivalence(value, correctAnswer) 
    : null;

  return (
    <div className="space-y-2">
      <label htmlFor={`math-input-${label}`} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      
      <div className="space-y-2">
        <input
          id={`math-input-${label}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary
            ${error ? 'border-destructive' : 'border-border'}
            ${disabled ? 'bg-muted disabled:cursor-not-allowed' : 'bg-background'}
          `}
          aria-label={label}
        />

        <div data-testid="katex-preview" className="min-h-[2rem] p-2 bg-muted/30 rounded-md border border-border">
          {value ? <InlineMath math={value} /> : <span className="text-muted-foreground text-sm">Preview will appear here</span>}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {isValid !== null && (
          <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {isValid ? '✓ Correct' : '✗ Incorrect'}
          </p>
        )}
      </div>
    </div>
  );
}
