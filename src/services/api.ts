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

// Helper: generate comma-separated list of YYYY-MM-DD between start and end (inclusive)
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

// Helper: parse comma-separated absence_dates into array and compute start/end
function parseAbsenceDates(datesCsv: string | null | undefined) {
  if (!datesCsv) return { dates: [], startDate: null, endDate: null };
  const parts = datesCsv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .sort(); // lexicographic YYYY-MM-DD sorts correctly
  return {
    dates: parts,
    startDate: parts.length ? parts[0] : null,
    endDate: parts.length ? parts[parts.length - 1] : null,
  };
}

class ApiService {
  // Employee endpoints
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
          role,
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

    // Normalize shift_assignments into array (some drivers may return single object)
    let rawAssignments: any = (data as any).shift_assignments;
    if (!rawAssignments) rawAssignments = [];
    if (!Array.isArray(rawAssignments)) {
      // wrap single object into array
      console.warn('Normalized single shift_assignments object into array', rawAssignments);
      rawAssignments = [rawAssignments];
    }

    const employeeId = (data as any).id;

    const assignments = rawAssignments.filter((a: any) => a && String(a.employee_id) === String(employeeId));

    // Map assignments -> shifts, but normalize a.shifts into array if needed
    const upcomingShifts = assignments
      .flatMap((a: any) => {
        let shiftsRaw = a.shifts;
        if (!shiftsRaw) return []; // no shifts on this assignment
        if (!Array.isArray(shiftsRaw)) {
          // sometimes nested result is a single object — normalize
          console.warn('Normalized single shifts object into array for assignment', { assignmentId: a.id, shiftsRaw });
          shiftsRaw = [shiftsRaw];
        }

        return shiftsRaw.map((shift: any) => ({
          id: shift.id,
          date: shift.date,
          type: shift.shift_type,
          startTime: shift.start_time,
          endTime: shift.end_time,
          // assignment-level metadata
          assignmentId: a.id,
          assignedAt: a.assigned_at,
          assignmentStatus: a.status,
          skillLevel: a.skill_level,
          role: (a as any).role ?? a.status ?? 'assigned',
        }));
      })
      .filter((shift: any) => {
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

  // Absence endpoints
  async submitAbsence(absence: Absence): Promise<{ success: boolean; message: string }> {
    // If your absences table uses month + absence_dates + notes, adapt accordingly.
    try {
      const start = absence.startDate;
      const end = absence.endDate ?? absence.startDate;
      const absenceDates = datesBetween(start, end);
      const month = `${new Date(start).getFullYear()}-${String(new Date(start).getMonth() + 1).padStart(2, '0')}-01`;
      const notes = absence.customReason || absence.reason || null;

      const { data, error } = await supabase
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
      console.error('submitAbsence - unexpected error:', err);
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
