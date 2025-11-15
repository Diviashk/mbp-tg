import { createClient } from '@supabase/supabase-js';
import { Absence, ShiftPreference, Employee } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

class ApiService {
  // Employee endpoints
  async getEmployee(telegramUserId: number): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        shifts:shifts(*)
      `)
      .eq('telegram_user_id', telegramUserId)
      .single();

    if (error) {
      console.error('Error fetching employee:', error);
      throw new Error('Employee not found');
    }

    // Transform upcoming shifts
    const upcomingShifts = (data.shifts || [])
      .filter((shift: any) => new Date(shift.date) >= new Date())
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
      .map((shift: any) => ({
        id: shift.id,
        date: shift.date,
        type: shift.shift_type,
        startTime: shift.start_time,
        endTime: shift.end_time,
      }));

    return {
      id: data.id,
      telegramUserId: data.telegram_user_id,
      name: data.name,
      upcomingShifts,
    };
  }

  async getUpcomingShifts(employeeId: string): Promise<Employee['upcomingShifts']> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Error fetching shifts:', error);
      throw new Error('Failed to fetch shifts');
    }

    return (data || []).map(shift => ({
      id: shift.id,
      date: shift.date,
      type: shift.shift_type,
      startTime: shift.start_time,
      endTime: shift.end_time,
    }));
  }

  // Absence endpoints
  async submitAbsence(absence: Absence): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase
      .from('absences')
      .insert({
        employee_id: absence.employeeId,
        start_date: absence.startDate,
        end_date: absence.endDate,
        reason: absence.reason,
        custom_reason: absence.customReason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting absence:', error);
      throw new Error('Failed to submit absence');
    }

    return {
      success: true,
      message: 'Absence submitted successfully',
    };
  }

  async getAbsences(employeeId: string): Promise<Absence[]> {
    const { data, error } = await supabase
      .from('absences')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching absences:', error);
      throw new Error('Failed to fetch absences');
    }

    return (data || []).map(absence => ({
      id: absence.id,
      employeeId: absence.employee_id,
      startDate: absence.start_date,
      endDate: absence.end_date,
      reason: absence.reason,
      customReason: absence.custom_reason,
      status: absence.status,
    }));
  }

  // Preference endpoints
  async updatePreferences(
    employeeId: string,
    preferences: ShiftPreference[]
  ): Promise<{ success: boolean; message: string }> {
    // First, delete existing preferences for this employee
    await supabase
      .from('shift_preferences')
      .delete()
      .eq('employee_id', employeeId);

    // Then insert new preferences
    const preferencesToInsert = preferences.map(pref => ({
      employee_id: pref.employeeId,
      shift_type: pref.shiftType,
      days: pref.days,
    }));

    const { error } = await supabase
      .from('shift_preferences')
      .insert(preferencesToInsert);

    if (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }

    return {
      success: true,
      message: 'Preferences updated successfully',
    };
  }

  async getPreferences(employeeId: string): Promise<ShiftPreference[]> {
    const { data, error } = await supabase
      .from('shift_preferences')
      .select('*')
      .eq('employee_id', employeeId);

    if (error) {
      console.error('Error fetching preferences:', error);
      throw new Error('Failed to fetch preferences');
    }

    return (data || []).map(pref => ({
      employeeId: pref.employee_id,
      shiftType: pref.shift_type,
      days: pref.days,
    }));
  }
}

export const apiService = new ApiService();
