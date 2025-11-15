import React from 'react';
import { DayOfWeek } from '../../types';

interface ShiftToggleProps {
  days: DayOfWeek[];
  selectedDays: DayOfWeek[];
  onToggle: (day: DayOfWeek) => void;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const ShiftToggle: React.FC<ShiftToggleProps> = ({
  days,
  selectedDays,
  onToggle,
}) => {
  const isSelected = (day: DayOfWeek) => selectedDays.includes(day);

  return (
    <div className="grid grid-cols-4 gap-3">
      {days.map((day) => (
        <button
          key={day}
          onClick={() => onToggle(day)}
          className={`
            min-h-[56px] rounded-xl
            flex items-center justify-center
            text-base font-semibold
            transition-all duration-200
            active:scale-95
            border-2
            ${
              isSelected(day)
                ? 'bg-tg-button text-tg-button-text border-tg-button shadow-md'
                : 'bg-tg-secondary-bg text-tg-text border-transparent'
            }
          `}
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isSelected(day) && <span className="mr-1">✓</span>}
          {DAY_LABELS[day]}
        </button>
      ))}
    </div>
  );
};
