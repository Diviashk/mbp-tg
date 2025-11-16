import React, { useState, useEffect } from 'react';
import { CalendarPicker } from './ui/CalendarPicker';
import { ReasonChip } from './ui/ReasonChip';
import { AbsenceReason } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { format } from 'date-fns';

interface ReportAbsenceProps {
  employeeId: string;
  onSubmit: (data: {
    startDate: string;
    endDate: string;
    reason: string;
    customReason?: string;
  }) => Promise<void>;
  onBack: () => void;
}

const ABSENCE_REASONS: AbsenceReason[] = [
  { id: 'sick', label: 'Sick Leave', emoji: '🤒' },
  { id: 'vacation', label: 'Vacation', emoji: '🏖️' },
  { id: 'family', label: 'Family Emergency', emoji: '👨‍👩‍👧' },
  { id: 'personal', label: 'Personal Leave', emoji: '🙋' },
  { id: 'other', label: 'Other', emoji: '✏️' },
];

export const ReportAbsence: React.FC<ReportAbsenceProps> = ({
  employeeId,
  onSubmit,
  onBack,
}) => {
  const { showMainButton, hideMainButton, showBackButton, hideBackButton, hapticFeedback, showAlert, webApp } = useTelegram();
  
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedRange, setSelectedRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedReason, setSelectedReason] = useState<AbsenceReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expand Telegram viewport on mount
  useEffect(() => {
    if (webApp) {
      webApp.expand();
      if (webApp.enableVerticalSwipes) {
        webApp.enableVerticalSwipes();
      }
    }
  }, [webApp]);

  useEffect(() => {
    showBackButton(onBack);
    return () => hideBackButton();
  }, [onBack, showBackButton, hideBackButton]);

  useEffect(() => {
    const canSubmit = selectedReason && (
      (mode === 'single' && selectedDate) ||
      (mode === 'range' && selectedRange[0] && selectedRange[1])
    );

    if (canSubmit) {
      showMainButton('Submit Absence', handleSubmit);
    } else {
      hideMainButton();
    }

    return () => hideMainButton();
  }, [mode, selectedDate, selectedRange, selectedReason]);

  const handleModeChange = (newMode: 'single' | 'range') => {
    hapticFeedback.selection();
    setMode(newMode);
    setSelectedDate(null);
    setSelectedRange([null, null]);
  };

  const handleReasonSelect = (reason: AbsenceReason) => {
    hapticFeedback.light();
    setSelectedReason(reason);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      showAlert('Please select a reason for absence');
      return;
    }

    let startDate: string;
    let endDate: string;

    if (mode === 'single' && selectedDate) {
      startDate = format(selectedDate, 'yyyy-MM-dd');
      endDate = startDate;
    } else if (mode === 'range' && selectedRange[0] && selectedRange[1]) {
      startDate = format(selectedRange[0], 'yyyy-MM-dd');
      endDate = format(selectedRange[1], 'yyyy-MM-dd');
    } else {
      showAlert('Please select a date or date range');
      return;
    }

    if (selectedReason.id === 'other' && !customReason.trim()) {
      showAlert('Please provide a reason for your absence');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback.medium();

    try {
      await onSubmit({
        startDate,
        endDate,
        reason: selectedReason.id,
        customReason: selectedReason.id === 'other' ? customReason : undefined,
      });
      hapticFeedback.success();
    } catch (error) {
      hapticFeedback.error();
      showAlert('Failed to submit absence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text p-4 pb-32 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-6 pb-8">
        {/* Header */}
        <div className="pt-4 pb-2">
          <h1 className="text-2xl font-bold">📅 Report Absence</h1>
          <p className="text-sm text-tg-hint mt-1">
            Select the date(s) and reason for your absence
          </p>
        </div>

        {/* Date Mode Toggle */}
        <div className="bg-tg-secondary-bg rounded-2xl p-2 flex gap-2">
          <button
            onClick={() => handleModeChange('single')}
            className={`
              flex-1 py-3 rounded-xl font-semibold text-base
              transition-all duration-200
              ${
                mode === 'single'
                  ? 'bg-tg-button text-tg-button-text shadow-md'
                  : 'text-tg-text'
              }
            `}
          >
            📅 Single Day
          </button>
          <button
            onClick={() => handleModeChange('range')}
            className={`
              flex-1 py-3 rounded-xl font-semibold text-base
              transition-all duration-200
              ${
                mode === 'range'
                  ? 'bg-tg-button text-tg-button-text shadow-md'
                  : 'text-tg-text'
              }
            `}
          >
            📆 Date Range
          </button>
        </div>

        {/* Calendar */}
        <CalendarPicker
          mode={mode}
          selectedDate={selectedDate}
          selectedRange={selectedRange}
          onDateChange={setSelectedDate}
          onRangeChange={setSelectedRange}
        />

        {/* Reason Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Select Reason</h2>
          <div className="space-y-2">
            {ABSENCE_REASONS.map((reason) => (
              <ReasonChip
                key={reason.id}
                reason={reason}
                isSelected={selectedReason?.id === reason.id}
                onSelect={handleReasonSelect}
              />
            ))}
          </div>
        </div>

        {/* Custom Reason Input */}
        {selectedReason?.id === 'other' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-tg-text">
              Please specify the reason
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter reason..."
              rows={3}
              className="w-full p-4 rounded-xl bg-tg-secondary-bg text-tg-text text-base border-2 border-transparent focus:border-tg-button outline-none resize-none"
              style={{ fontSize: '16px' }}
            />
          </div>
        )}

        {isSubmitting && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-tg-hint border-t-tg-button"></div>
          </div>
        )}

        {/* Extra spacer for Main Button */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};
