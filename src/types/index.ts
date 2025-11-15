// Type definitions for the Shift Spark Telegram Mini App

export type ShiftType = 'morning' | 'evening' | 'night';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Shift {
  id: string;
  date: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
}

export interface AbsenceReason {
  id: string;
  label: string;
  emoji: string;
}

export interface Absence {
  id?: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  customReason?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ShiftPreference {
  employeeId: string;
  shiftType: ShiftType;
  days: DayOfWeek[];
}

export interface Employee {
  id: string;
  telegramUserId: number;
  name: string;
  upcomingShifts: Shift[];
}

export type Screen = 'home' | 'report-absence' | 'update-preference' | 'confirmation';

export interface AppState {
  currentScreen: Screen;
  employee: Employee | null;
  isLoading: boolean;
  error: string | null;
}
