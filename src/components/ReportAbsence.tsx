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
  { id: 'sick', label: 'Sick', emoji: '🤒' },
  { id: 'vacation', label: 'Vacation', emoji: '🏖️' },
  { id: 'personal', label: 'Personal', emoji: '🙋' },
];

export const ReportAbsence: React.FC<ReportAbsenceProps> = ({
  employeeId,
  onSubmit,
  onBack,
}) => {
  const { showMainButton, hideMainButton, showBackButton, hideBackButton, hapticFeedback, showAlert, webApp } = useTelegram();
  
  const [selectedRange, setSelectedRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedReason, setSelectedReason] = useState<AbsenceReason | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (webApp) {
      webApp.expand();
    }
  }, [webApp]);

  useEffect(() => {
    showBackButton(onBack);
    return () => hideBackButton();
  }, [onBack, showBackButton, hideBackButton]);

  useEffect(() => {
    const canSubmit = selectedReason && selectedRange[0] && selectedRange[1];

    if (canSubmit) {
      showMainButton('Submit Absence', handleSubmit);
    } else {
      hideMainButton();
    }

    return () => hideMainButton();
  }, [selectedRange, selectedReason]);

  const handleReasonSelect = (reason: AbsenceReason) => {
    hapticFeedback.light();
    setSelectedReason(reason);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      showAlert('Please select a reason');
      return;
    }

    if (!selectedRange[0] || !selectedRange[1]) {
      showAlert('Please select dates');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback.medium();

    try {
      const startDate = format(selectedRange[0], 'yyyy-MM-dd');
      const endDate = format(selectedRange[1], 'yyyy-MM-dd');
      
      await onSubmit({
        startDate,
        endDate,
        reason: selectedReason.id,
      });
      hapticFeedback.success();
    } catch (error) {
      hapticFeedback.error();
      showAlert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-tg-bg text-tg-text flex flex-col">
      <div className="flex-1 overflow-y-auto p-3 pb-20">
        <div className="max-w-md mx-auto space-y-2">
          {/* Ultra Compact Header */}
          <div className="pb-1">
            <h1 className="text-lg font-bold">📅 Report Absence</h1>
          </div>

          {/* Ultra Compact Calendar */}
          <div className="bg-tg-secondary-bg rounded-lg p-1.5">
            <CalendarPicker
              mode="range"
              selectedDate={null}
              selectedRange={selectedRange}
              onDateChange={() => {}}
              onRangeChange={setSelectedRange}
            />
          </div>

          {/* Compact Reason Selection */}
          <div>
            <h2 className="text-xs font-semibold mb-1.5 text-tg-hint">Select Reason</h2>
            <div className="grid grid-cols-3 gap-1.5">
              {ABSENCE_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => handleReasonSelect(reason)}
                  className={`
                    px-2 py-2 rounded-lg text-xs font-medium
                    transition-all duration-200
                    flex flex-col items-center gap-1
                    ${
                      selectedReason?.id === reason.id
                        ? 'bg-tg-button text-tg-button-text shadow-md'
                        : 'bg-tg-secondary-bg text-tg-text'
                    }
                  `}
                >
                  <span className="text-xl">{reason.emoji}</span>
                  <span className="text-[10px]">{reason.label}</span>
                </button>
              ))}
            </div>
          </div>

          {isSubmitting && (
            <div className="text-center py-2">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-4 border-tg-hint border-t-tg-button"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
