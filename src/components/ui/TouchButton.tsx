import React from 'react';

interface TouchButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full min-h-[72px] rounded-2xl px-6 py-4
        flex items-center justify-center gap-3
        text-lg font-semibold
        transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          variant === 'primary'
            ? 'bg-tg-button text-tg-button-text shadow-lg'
            : 'bg-tg-secondary-bg text-tg-text'
        }
      `}
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span className="text-3xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
};
