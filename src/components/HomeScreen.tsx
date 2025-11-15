import React from 'react';
import { TouchButton } from './ui/TouchButton';
import { Employee } from '../types';
import { format } from 'date-fns';
import { useTelegram } from '../hooks/useTelegram';

interface HomeScreenProps {
  employee: Employee | null;
  onNavigate: (screen: 'report-absence') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ employee, onNavigate }) => {
  const { hapticFeedback } = useTelegram();

  const handleReportAbsence = () => {
    hapticFeedback.light();
    onNavigate('report-absence');
  };

  const getShiftTime = (shift: Employee['upcomingShifts'][0]) => {
    if (shift.type === 'morning') return 'Morning';
    if (shift.type === 'evening') return 'Evening';
    return 'Night';
  };

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text p-4 pb-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold mb-2">
            👋 Welcome{employee?.name ? `, ${employee.name}` : ''}!
          </h1>
          <p className="text-tg-hint">Manage your shift schedule</p>
        </div>

        {/* Main Action */}
        <div className="space-y-4">
          <TouchButton
            icon="📅"
            label="Report Absence"
            onClick={handleReportAbsence}
            variant="primary"
          />
        </div>

        {/* Upcoming Shifts */}
        {employee?.upcomingShifts && employee.upcomingShifts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📆</span>
              <span>My Upcoming Shifts</span>
            </h2>
            <div className="bg-tg-secondary-bg rounded-2xl p-4 space-y-3">
              {employee.upcomingShifts.slice(0, 5).map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(shift.date), 'EEE, MMM d')}
                    </p>
                    <p className="text-sm text-tg-hint">
                      {getShiftTime(shift)} ({shift.startTime} - {shift.endTime})
                    </p>
                  </div>
                  <div className="text-2xl">
                    {shift.type === 'morning' ? '🌅' : shift.type === 'evening' ? '🌆' : '🌙'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-tg-secondary-bg rounded-2xl p-4 mt-6">
          <p className="text-sm text-tg-hint text-center">
            💡 Need to report an absence? Tap the button above to let your manager know.
          </p>
        </div>
      </div>
    </div>
  );
};
