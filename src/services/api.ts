// src/services/api.ts
import { createClient } from '@supabase/supabase-js';
import { Absence, Employee } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Helper: create comma-separated date list
function datesBetween(startDate: string, endDate: string): string {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const dates: string[] = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates.join(',');
}

// Helper: parse absence_dates
function parseAbsenceDates(datesCsv: string | null | undefined) {
  if (!datesCsv) return { dates: [], startDate: null, endDate: null };
  const parts = datesCsv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .sort();
  return {
    dates: parts,
    startDate: parts[0] || null,
    endDate: parts[parts.length - 1] || null,
  };
}

class ApiService {
  // ============================================================
  // EMPLOYEE + UPCOMING SHIFTS
  // ============================================================

  async getEmployee(telegramUserId: number | string): Promise<Employee> {
    const tgid = String(telegramUserId);

    const { data, error } = await supabase
      .from('employees')
      .select(`
        id,
        name,
        telegram_user_id,
        shift_assignments (
          id,
          shift_id,
          employee_id,
          assigned_at,
          status,
          skill_level,
          shifts (
            id,
            date,
            shift_type,
            start_time,
            end_time
          )
        )
      `)
      .eq('telegram_user_id', tgid)
      .single();

    if (error) {
      console.error('Error fetching employee assignments:', error);
      throw new Error(error.message || 'Employee not found');
    }

    // Normalize shift_assignments to array
    let rawAssignments: any = (data as any).shift_assignments || [];
    if (!Array.isArray(rawAssignments)) rawAssignments = [rawAssignments];

    const employeeId = data.id;

    const assignments = rawAssignments.filter(
      (a: any) => a && String(a.employee_id) === String(employeeId)
    );

    // Flatten shifts from assignments
    const upcomingShifts = assignments
      .flatMap((a: any) => {
        let shiftsRaw = a.shifts;
        if (!shiftsRaw) return [];
        if (!Array.isArray(shiftsRaw)) shiftsRaw = [shiftsRaw];

        return shiftsRaw.map((shift: any) => ({
          id: shift.id,
          date: shift.date,
          type: shift.shift_type,
          startTime: shift.start_time,
          endTime: shift.end_time,
          assignmentId: a.id,
          assignedAt: a.assigned_at,
          assignmentStatus: a.status,
          skillLevel: a.skill_level,

          // Derived role (since DB has no `role` column)
          role: a.status ?? 'assigned',
        }));
      })
      .filter((shift: any) => {
        // Future or today
        const shiftDate = new Date(shift.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        shiftDate.setHours(0, 0, 0, 0);
        return shiftDate >= today;
      })
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    return {
      id: data.id,
      telegramUserId: data.telegram_user_id,
      name: data.name,
      upcomingShifts,
    };
  }

  // ============================================================
  // ABSENCES
  // ============================================================

  async submitAbsence(absence: Absence): Promise<{ success: boolean; message: string }> {
    try {
      const start = absence.startDate;
      const end = absence.endDate ?? absence.startDate;
      const absenceDates = datesBetween(start, end);

      const month = `${new Date(start).getFullYear()}-${String(
        new Date(start).getMonth() + 1
      ).padStart(2, '0')}-01`;

      const notes = absence.customReason || absence.reason || null;

      const { error } = await supabase
        .from('absences')
        .insert({
          employee_id: absence.employeeId,
          month,
          absence_dates: absenceDates,
          notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting absence:', error);
        throw new Error(error.message || 'Failed to submit absence');
      }

      return {
        success: true,
        message: 'Absence submitted successfully',
      };
    } catch (err: any) {
      console.error('submitAbsence unexpected error:', err);
      throw new Error(err?.message || 'Failed to submit absence');
    }
  }

  async getAbsences(employeeId: string): Promise<Absence[]> {
    const { data, error } = await supabase
      .from('absences')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching absences:', error);
      throw new Error(error.message || 'Failed to fetch absences');
    }

    return (data || []).map((row: any) => {
      const parsed = parseAbsenceDates(row.absence_dates);
      return {
        id: row.id,
        employeeId: row.employee_id,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        absenceDates: parsed.dates,
        reason: row.notes || null,
        customReason: row.notes || null,
        status: row.status || null,
        createdAt: row.created_at || null,
      } as Absence;
    });
  }
}

export const apiService = new ApiService();
