import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { Employee, Screen } from '../types';
import { apiService } from '../services/api';

interface ShiftData {
  date: string;
  shift_type: 'morning' | 'evening' | null;
  status: 'scheduled' | 'absent' | 'available';
  note?: string;
}

interface HomeScreenProps {
  employee: Employee | null;
  onNavigate: (screen: Screen) => void;
}

export function HomeScreen({ employee, onNavigate }: HomeScreenProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });

  const [shiftData, setShiftData] = useState<Record<string, ShiftData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Fetch week data
  useEffect(() => {
    const fetchWeekData = async () => {
      if (!employee) return;

      try {
        setLoading(true);
        const startDate = new Date(currentWeekStart);
        const endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);

        const data = await apiService.getWeekShifts(
          employee.id,
          formatDateISO(startDate),
          formatDateISO(endDate)
        );

        setShiftData(data);
      } catch (error) {
        console.error('Failed to fetch week data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, [employee, currentWeekStart]);

  const formatDateISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-500 text-white';
      case 'absent':
        return 'bg-red-500 text-white';
      case 'available':
        return 'bg-gray-300 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-400';
    }
  };

  const getShiftLabel = (shift_type: string | null) => {
    switch (shift_type) {
      case 'morning':
        return '🌅 Morn';
      case 'evening':
        return '🌆 Eve';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle size={14} className="inline" />;
      case 'absent':
        return <XCircle size={14} className="inline" />;
      default:
        return null;
    }
  };

  const weekDays = getWeekDays();
  const weekStart = formatDateISO(currentWeekStart);
  const weekEnd = formatDateISO(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000));

  if (showDetail && selectedDate) {
    const dayData = shiftData[selectedDate];
    const date = new Date(selectedDate + 'T00:00:00');
    const dayName = date.toLocaleString('default', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    return (
      <div className="app-container flex flex-col min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-b-2xl">
          <h2 className="text-lg font-bold">{dayName}</h2>
        </div>

        {/* Detail Content */}
        <div className="flex-1 p-4">
          {dayData ? (
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-3">
                {getStatusIcon(dayData.status)}
                <span className="font-semibold capitalize text-white">{dayData.status}</span>
              </div>

              {dayData.shift_type && (
                <div className="mb-2">
                  <p className="text-gray-400 text-sm">Shift</p>
                  <p className="font-semibold capitalize text-white">
                    {getShiftLabel(dayData.shift_type)}
                  </p>
                </div>
              )}

              {dayData.status === 'absent' && dayData.note && (
                <div>
                  <p className="text-gray-400 text-sm">Reason</p>
                  <p className="text-sm capitalize text-white">{dayData.note}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 p-4 rounded-lg mb-4 text-center text-gray-400 text-sm">
              No shift scheduled
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => onNavigate('report-absence')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold text-sm"
          >
            📋 Report Absence
          </button>
          <button
            onClick={() => setShowDetail(false)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container flex flex-col min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-b-2xl">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() =>
              setCurrentWeekStart(
                new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
              )
            }
            className="p-1 hover:bg-purple-500 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-sm font-bold">{weekStart} - {weekEnd}</h2>
          <button
            onClick={() =>
              setCurrentWeekStart(
                new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
              )
            }
            className="p-1 hover:bg-pink-500 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Employee Info */}
        {employee && (
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg text-xs">
            <p className="font-semibold">{employee.name}</p>
            <p className="text-purple-200">{employee.phone}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-800 p-3 grid grid-cols-2 gap-2 text-xs text-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded"></div>
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded"></div>
          <span>Available</span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : (
          <div className="space-y-2">
            {weekDays.map((day) => {
              const dateStr = formatDateISO(day);
              const dayData = shiftData[dateStr];
              const dayName = day.toLocaleString('default', { weekday: 'short' });
              const dayNum = day.getDate();

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setShowDetail(true);
                  }}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all cursor-pointer
                    ${dayData ? getStatusColor(dayData.status) : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">
                        {dayName} {dayNum}
                      </p>
                      {dayData && dayData.shift_type && (
                        <p className="text-xs">{getShiftLabel(dayData.shift_type)}</p>
                      )}
                      {dayData && dayData.status === 'absent' && (
                        <p className="text-xs">{dayData.note}</p>
                      )}
                    </div>
                    {dayData && getStatusIcon(dayData.status)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => onNavigate('report-absence')}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold text-sm"
        >
          📋 Report Absence
        </button>
      </div>
    </div>
  );
}
