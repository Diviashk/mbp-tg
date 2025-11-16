import React from 'react';
import { AbsenceReason } from '../../types';

interface ReasonChipProps {
  reason: AbsenceReason;
  isSelected: boolean;
  onSelect: (reason: AbsenceReason) => void;
}

export const ReasonChip: React.FC<ReasonChipProps> = ({
  reason,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect(reason)}
      className={`
        w-full px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        flex items-center gap-2
        ${
          isSelected
            ? 'bg-tg-button text-tg-button-text shadow-md'
            : 'bg-tg-secondary-bg text-tg-text hover:bg-tg-button hover:bg-opacity-10'
        }
      `}
    >
      <span className="text-base">{reason.emoji}</span>
      <span>{reason.label}</span>
      {isSelected && <span className="ml-auto">✓</span>}
    </button>
  );
};
