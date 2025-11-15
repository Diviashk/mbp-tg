import React, { useState, useEffect } from 'react';
import { ShiftToggle } from './ui/ShiftToggle';
import { ShiftType, DayOfWeek, ShiftPreference } from '../types';
import { useTelegram } from '../hooks/useTelegram';

interface UpdatePreferenceProps {
  employeeId: string;
  initialPreferences?: ShiftPreference[];
  onSubmit: (preferences: ShiftPreference[]) => Promise<void>;
  onBack: () => void;
}

const ALL_DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const SHIFT_INFO = {
  morning: { label: 'Morning Shift', time: '6 AM - 2 PM', emoji: '🌅' },
  evening: { label: 'Evening Shift', time: '2 PM - 10 PM', emoji: '🌆' },
  night: { label: 'Night Shift', time: '10 PM - 6 AM', emoji: '🌙' },
};

export const UpdatePreference: React.FC<UpdatePreferenceProps> = ({
  employeeId,
  initialPreferences = [],
  onSubmit,
  onBack,
}) => {
  const { showMainButton, hideMainButton, showBackButton, hideBackButton, hapticFeedback, showAlert } = useTelegram();
  
  const [preferences, setPreferences] = useState<Record<ShiftType, DayOfWeek[]>>(() => {
    const initial: Record<ShiftType, DayOfWeek[]> = {
      morning: [],
      evening: [],
      night: [],
    };
    
    initialPreferences.forEach((pref) => {
      initial[pref.shiftType] = pref.days;
    });
    
    return initial;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    showBackButton(onBack);
    return () => hideBackButton();
  }, [onBack, showBackButton, hideBackButton]);

  useEffect(() => {
    const hasPreferences = Object.values(preferences).some(days => days.length > 0);
    
    if (hasPreferences) {
      showMainButton('Save Preferences', handleSubmit);
    } else {
      hideMainButton();
    }

    return () => hideMainButton();
  }, [preferences]);

  const handleToggleDay = (shiftType: ShiftType, day: DayOfWeek) => {
    hapticFeedback.selection();
    
    setPreferences((prev) => {
      const currentDays = prev[shiftType];
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];
      
      return {
        ...prev,
        [shiftType]: newDays,
      };
    });
  };

  const handleSelectAll = (shiftType: ShiftType) => {
    hapticFeedback.light();
    
    setPreferences((prev) => ({
      ...prev,
      [shiftType]: prev[shiftType].length === ALL_DAYS.length ? [] : [...ALL_DAYS],
    }));
  };

  const handleSubmit = async () => {
    const formattedPreferences: ShiftPreference[] = (Object.entries(preferences) as [ShiftType, DayOfWeek[]][])
      .filter(([_, days]) => days.length > 0)
      .map(([shiftType, days]) => ({
        employeeId,
        shiftType,
        days,
      }));

    if (formattedPreferences.length === 0) {
      showAlert('Please select at least one shift preference');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback.medium();

    try {
      await onSubmit(formattedPreferences);
      hapticFeedback.success();
    } catch (error) {
      hapticFeedback.error();
      showAlert('Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderShiftSection = (shiftType: ShiftType) => {
    const info = SHIFT_INFO[shiftType];
    const selectedDays = preferences[shiftType];
    const allSelected = selectedDays.length === ALL_DAYS.length;

    return (
      <div key={shiftType} className="bg-tg-secondary-bg rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span>{info.emoji}</span>
              <span>{info.label}</span>
            </h3>
            <p className="text-sm text-tg-hint mt-1">{info.time}</p>
          </div>
          <button
            onClick={() => handleSelectAll(shiftType)}
            className="px-4 py-2 rounded-lg bg-tg-bg text-tg-button text-sm font-medium active:scale-95 transition-transform"
          >
            {allSelected ? 'Clear All' : 'Select All'}
          </button>
        </div>
        
        <ShiftToggle
          days={ALL_DAYS}
          selectedDays={selectedDays}
          onToggle={(day) => handleToggleDay(shiftType, day)}
        />
        
        {selectedDays.length > 0 && (
          <div className="pt-2 border-t border-tg-bg">
            <p className="text-sm text-tg-hint">
              {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text p-4 pb-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="pt-4 pb-2">
          <h1 className="text-2xl font-bold">⭐ Shift Preferences</h1>
          <p className="text-sm text-tg-hint mt-1">
            Select your preferred shifts for each day
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
          <p className="text-sm text-tg-text">
            💡 <strong>Tip:</strong> Selecting more days increases your chances of getting shifts that match your availability!
          </p>
        </div>

        {/* Shift Sections */}
        <div className="space-y-4">
          {renderShiftSection('morning')}
          {renderShiftSection('evening')}
          {renderShiftSection('night')}
        </div>

        {/* Summary */}
        <div className="bg-tg-secondary-bg rounded-2xl p-4">
          <h3 className="font-semibold mb-2">Summary</h3>
          <div className="space-y-1 text-sm">
            {(Object.entries(preferences) as [ShiftType, DayOfWeek[]][]).map(([shiftType, days]) => (
              days.length > 0 && (
                <p key={shiftType} className="text-tg-hint">
                  {SHIFT_INFO[shiftType].emoji} {SHIFT_INFO[shiftType].label}: {days.length} days
                </p>
              )
            ))}
            {Object.values(preferences).every(days => days.length === 0) && (
              <p className="text-tg-hint italic">No preferences selected yet</p>
            )}
          </div>
        </div>

        {isSubmitting && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-tg-hint border-t-tg-button"></div>
          </div>
        )}
      </div>
    </div>
  );
};
