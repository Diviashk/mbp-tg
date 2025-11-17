// src/services/api.ts
import { createClient } from '@supabase/supabase-js';
import { Absence, Employee } from '../types';

// Init Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// Helper: expand dates between start & end
function datesBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const out: string[] = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    out.push(`${yyyy}-${mm}-${dd}`);
  }
  return out;
}

// Helper: local time formatting
function formatLocalTime(dateStr: string, timeStr: string | null) {
  if (!dateStr || !timeStr) return null;
  const [h, m] = timeStr.split(":");
  const d = new Date(dateStr);
  d.setHours(Number(h), Number(m), 0, 0);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Helper parse absence_dates
function parseAbsenceDates(csv: string | null) {
  if (!csv) return { dates: [], startDate: null, endDate: null };
  const parts = csv.split(",").map(s => s.trim()).filter(Boolean).sort();
  return { dates: parts, startDate: parts[0], endDate: parts[parts.length - 1] };
}

// NEW: Format date to YYYY-MM-DD
function formatDateISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface ShiftData {
  date: string;
  shift_type: 'morning' | 'evening' | null;
  status: 'scheduled' | 'absent' | 'available';
  note?: string;
}

class ApiService {

  // ================================
  // GET EMPLOYEE + UPCOMING SHIFTS
  // ================================
  async getEmployee(telegramUserId: number | string): Promise<Employee> {
    const tgid = String(telegramUserId);

    const { data, error } = await supabase
      .from("employees")
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
          shifts:shift_id (
            id,
            date,
            shift_type,
            start_time,
            end_time
          )
        )
      `)
      .eq("telegram_user_id", tgid)
      .single();

    if (error) {
      console.error("Error fetching employee:", error);
      throw new Error(error.message || "Employee not found");
    }

    const assignments = (data.shift_assignments || []).map((a: any) => {
      const shift = a.shifts; // joined shift
      return {
        assignmentId: a.id,
        assignedAt: a.assigned_at,
        assignmentStatus: a.status,
        skillLevel: a.skill_level,
        role: a.status, // confirmed, etc.

        // shift data
        id: shift?.id,
        date: shift?.date,
        type: shift?.shift_type,
        startTime: shift?.start_time,
        endTime: shift?.end_time,

        displayStartTime: formatLocalTime(shift?.date, shift?.start_time),
        displayEndTime: formatLocalTime(shift?.date, shift?.end_time)
      };
    });

    // Filter upcoming shifts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingShifts = assignments
      .filter(s => s.date && new Date(s.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    return {
      id: data.id,
      telegramUserId: data.telegram_user_id,
      name: data.name,
      upcomingShifts
    };
  }

  // ================================
  // NEW: GET WEEK SHIFTS + ABSENCES
  // ================================
  async getWeekShifts(
    employeeId: string,
    startDate: string,
    endDate: string
  ): Promise<Record<string, ShiftData>> {
    try {
      console.log("📅 Fetching week shifts for:", employeeId, startDate, endDate);

      // Get all shifts for employee in date range
      const { data: shiftsData, error: shiftsError } = await supabase
        .from("shift_assignments")
        .select(`
          id,
          status,
          shifts (
            id,
            date,
            shift_type,
            start_time,
            end_time
          )
        `)
        .eq("employee_id", employeeId)
        .gte("shifts.date", startDate)
        .lte("shifts.date", endDate);

      if (shiftsError) {
        console.error("❌ Error fetching shifts:", shiftsError);
        throw shiftsError;
      }

      // Get all absences for this employee (all months)
      const { data: absencesData, error: absencesError } = await supabase
        .from("employee_availability")
        .select("absence_dates, notes")
        .eq("employee_id", employeeId);

      if (absencesError) {
        console.error("❌ Error fetching absences:", absencesError);
        throw absencesError;
      }

      // Build absence dates set
      const absenceDatesSet = new Set<string>();
      const absenceNotes: Record<string, string> = {};

      absencesData?.forEach((record: any) => {
        if (record.absence_dates) {
          const dates = record.absence_dates.split(",").map((d: string) => d.trim());
          dates.forEach((date: string) => {
            absenceDatesSet.add(date);
            if (record.notes) {
              absenceNotes[date] = record.notes;
            }
          });
        }
      });

      console.log("📅 Absence dates found:", Array.from(absenceDatesSet));

      // Build calendar data
      const calendarData: Record<string, ShiftData> = {};

      // Generate all dates in range
      const datesList = datesBetween(startDate, endDate);
      datesList.forEach((date: string) => {
        calendarData[date] = {
          date,
          shift_type: null,
          status: 'available',
          note: undefined
        };
      });

      // Add shifts
      shiftsData?.forEach((assignment: any) => {
        const shift = assignment.shifts;
        if (shift?.date) {
          calendarData[shift.date] = {
            date: shift.date,
            shift_type: (shift.shift_type?.toLowerCase() as 'morning' | 'evening') || null,
            status: 'scheduled',
            note: undefined
          };
        }
      });

      // Add absences (overwrite if shift exists)
      absenceDatesSet.forEach((date: string) => {
        if (calendarData[date]) {
          calendarData[date].status = 'absent';
          calendarData[date].shift_type = null;
          calendarData[date].note = absenceNotes[date];
        }
      });

      console.log("✅ Calendar data ready:", calendarData);
      return calendarData;

    } catch (error: any) {
      console.error("💥 Error in getWeekShifts:", error);
      throw error;
    }
  }

  // ======================================
  // SUBMIT ABSENCE TO employee_availability
  // WITH DETAILED LOGGING
  // ======================================
  async submitAbsence(absence: Absence) {
    try {
      console.log("📝 Starting absence submission...");
      console.log("Employee ID:", absence.employeeId);
      console.log("Start Date:", absence.startDate);
      console.log("End Date:", absence.endDate);
      console.log("Reason:", absence.reason);
      console.log("Custom Reason:", absence.customReason);

      const start = absence.startDate;
      const end = absence.endDate ?? absence.startDate;

      const newDatesArray = datesBetween(start, end);
      const newDates = newDatesArray.join(",");
      const month = `${start.slice(0, 7)}-01`;
      const notes = absence.customReason || absence.reason || null;

      console.log("📅 Calculated values:");
      console.log("New dates (CSV):", newDates);
      console.log("Month:", month);
      console.log("Notes:", notes);

      // First, check if record exists for this employee+month
      console.log("🔍 Checking for existing record...");
      const { data: existing, error: fetchError } = await supabase
        .from("employee_availability")
        .select("id, absence_dates, notes")
        .eq("employee_id", absence.employeeId)
        .eq("month", month)
        .maybeSingle();

      if (fetchError) {
        console.error("❌ Error checking existing record:", fetchError);
        throw new Error(fetchError.message);
      }

      console.log("Existing record:", existing);

      if (existing) {
        console.log("✏️ Updating existing record ID:", existing.id);
        
        // Record exists - MERGE dates
        const existingDates = existing.absence_dates ? existing.absence_dates.split(",").map(d => d.trim()) : [];
        
        console.log("Existing dates:", existingDates);
        console.log("New dates:", newDatesArray);
        
        // Combine and remove duplicates
        const mergedDatesSet = new Set([...existingDates, ...newDatesArray]);
        const mergedDates = Array.from(mergedDatesSet).sort().join(",");
        
        console.log("Merged dates:", mergedDates);
        
        // Combine notes
        const combinedNotes = existing.notes 
          ? `${existing.notes}; ${notes}` 
          : notes;

        console.log("Combined notes:", combinedNotes);

        // UPDATE existing record
        const { data: updateData, error: updateError } = await supabase
          .from("employee_availability")
          .update({
            absence_dates: mergedDates,
            notes: combinedNotes
          })
          .eq("id", existing.id)
          .select();

        console.log("Update result:", updateData);

        if (updateError) {
          console.error("❌ Error updating absence:", updateError);
          throw new Error(updateError.message);
        }

        console.log("✅ Successfully updated existing record");
        return { success: true, message: "Absence dates added successfully" };

      } else {
        console.log("➕ Inserting new record...");
        
        const insertData = {
          employee_id: absence.employeeId,
          month,
          absence_dates: newDates,
          notes
        };

        console.log("Insert data:", insertData);

        const { data: insertResult, error: insertError } = await supabase
          .from("employee_availability")
          .insert(insertData)
          .select();

        console.log("Insert result:", insertResult);

        if (insertError) {
          console.error("❌ Error inserting absence:", insertError);
          throw new Error(insertError.message);
        }

        console.log("✅ Successfully inserted new record");
        return { success: true, message: "Absence submitted successfully" };
      }

    } catch (err: any) {
      console.error("💥 Unexpected absence submit error:", err);
      throw err;
    }
  }

  // ================================
  // GET ABSENCES
  // ================================
  async getAbsences(employeeId: string) {
    const { data, error } = await supabase
      .from("employee_availability")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((row: any) => {
      const parsed = parseAbsenceDates(row.absence_dates);
      return {
        id: row.id,
        employeeId: row.employee_id,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        absenceDates: parsed.dates,
        reason: row.notes,
        customReason: row.notes,
        createdAt: row.created_at
      };
    });
  }
}

export const apiService = new ApiService();
