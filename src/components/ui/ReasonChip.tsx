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
        min-h-[56px] px-6 py-3 rounded-xl
        flex items-center gap-3
        text-base font-medium
        transition-all duration-200
        active:scale-95
        border-2
        ${
          isSelected
            ? 'bg-tg-button text-tg-button-text border-tg-button shadow-md'
            : 'bg-tg-secondary-bg text-tg-text border-transparent'
        }
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span className="text-2xl">{reason.emoji}</span>
      <span>{reason.label}</span>
    </button>
  );
};
