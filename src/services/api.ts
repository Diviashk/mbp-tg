import { createClient } from '@supabase/supabase-js';
import { Absence, Employee } from '../types';

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
}

export const apiService = new ApiService();
