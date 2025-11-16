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
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedReason, setSelectedReason] = useState<AbsenceReason | null>(null);
  const [customReason, setCustomReason] = useState('');
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
    const canSubmit = selectedReason && selectedDate && 
      (selectedReason.id !== 'other' || customReason.trim());

    if (canSubmit) {
      showMainButton('Submit Absence', handleSubmit);
    } else {
      hideMainButton();
    }

    return () => hideMainButton();
  }, [selectedDate, selectedReason, customReason]);

  const handleReasonSelect = (reason: AbsenceReason) => {
    hapticFeedback.light();
    setSelectedReason(reason);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      showAlert('Please select a reason for absence');
      return;
    }

    if (!selectedDate) {
      showAlert('Please select a date');
      return;
    }

    if (selectedReason.id === 'other' && !customReason.trim()) {
      showAlert('Please provide a reason for your absence');
      return;
    }

    setIsSubmitting(true);
    hapticFeedback.medium();

    try {
      const startDate = format(selectedDate, 'yyyy-MM-dd');
      await onSubmit({
        startDate,
        endDate: startDate,
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
    <div className="min-h-screen bg-tg-bg text-tg-text p-3">
      <div className="max-w-md mx-auto space-y-3">
        {/* Compact Header */}
        <div className="pt-2 pb-1">
          <h1 className="text-xl font-bold">📅 Report Absence</h1>
          <p className="text-xs text-tg-hint">Select date and reason</p>
        </div>

        {/* Compact Calendar */}
        <div className="bg-tg-secondary-bg rounded-xl p-2">
          <CalendarPicker
            mode="single"
            selectedDate={selectedDate}
            selectedRange={[null, null]}
            onDateChange={setSelectedDate}
            onRangeChange={() => {}}
          />
        </div>

        {/* Compact Reason Selection */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Reason</h2>
          <div className="space-y-1.5">
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

        {/* Compact Custom Reason Input */}
        {selectedReason?.id === 'other' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-tg-text">
              Specify reason
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Enter reason..."
              rows={2}
              className="w-full p-2 rounded-lg bg-tg-secondary-bg text-tg-text text-sm border-2 border-transparent focus:border-tg-button outline-none resize-none"
              style={{ fontSize: '14px' }}
            />
          </div>
        )}

        {isSubmitting && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-tg-hint border-t-tg-button"></div>
          </div>
        )}
      </div>
    </div>
  );
};
