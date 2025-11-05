'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  value: { from: Date | null; to: Date | null };
  onChange: (range: { from: Date | null; to: Date | null }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [fromInput, setFromInput] = useState(
    value.from ? value.from.toISOString().split('T')[0] : ''
  );
  const [toInput, setToInput] = useState(
    value.to ? value.to.toISOString().split('T')[0] : ''
  );

  const handleFromChange = (date: string) => {
    setFromInput(date);
    const newDate = date ? new Date(date) : null;
    onChange({ ...value, from: newDate });
  };

  const handleToChange = (date: string) => {
    setToInput(date);
    const newDate = date ? new Date(date) : null;
    onChange({ ...value, to: newDate });
  };

  const handleClear = () => {
    setFromInput('');
    setToInput('');
    onChange({ from: null, to: null });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date Range
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <Input
            type="date"
            value={fromInput}
            onChange={(e) => handleFromChange(e.target.value)}
            placeholder="Start date"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <Input
            type="date"
            value={toInput}
            onChange={(e) => handleToChange(e.target.value)}
            placeholder="End date"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleClear} className="w-full">
          Clear Dates
        </Button>
      </CardContent>
    </Card>
  );
}