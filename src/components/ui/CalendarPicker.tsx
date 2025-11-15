import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

interface CalendarPickerProps {
  mode: 'single' | 'range';
  selectedDate: Date | null;
  selectedRange: [Date | null, Date | null];
  onDateChange: (date: Date) => void;
  onRangeChange: (range: [Date, Date]) => void;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  mode,
  selectedDate,
  selectedRange,
  onDateChange,
  onRangeChange,
}) => {
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const handleDateClick = (value: Date | Date[]) => {
    if (mode === 'single' && value instanceof Date) {
      onDateChange(value);
    } else if (mode === 'range' && Array.isArray(value) && value.length === 2) {
      onRangeChange(value as [Date, Date]);
    }
  };

  return (
    <div className="w-full">
      <div className="calendar-wrapper bg-tg-secondary-bg rounded-2xl p-4 shadow-sm">
        <Calendar
          onChange={handleDateClick}
          value={mode === 'single' ? selectedDate : selectedRange}
          selectRange={mode === 'range'}
          minDate={new Date()}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => 
            activeStartDate && setActiveStartDate(activeStartDate)
          }
          className="w-full border-none"
          tileClassName="text-base py-4"
        />
      </div>
      
      {mode === 'single' && selectedDate && (
        <div className="mt-4 text-center">
          <p className="text-sm text-tg-hint">Selected Date</p>
          <p className="text-lg font-semibold text-tg-text">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      )}
      
      {mode === 'range' && selectedRange[0] && selectedRange[1] && (
        <div className="mt-4 text-center">
          <p className="text-sm text-tg-hint">Selected Range</p>
          <p className="text-lg font-semibold text-tg-text">
            {format(selectedRange[0], 'MMM d')} - {format(selectedRange[1], 'MMM d, yyyy')}
          </p>
        </div>
      )}
    </div>
  );
};
