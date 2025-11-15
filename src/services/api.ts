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
  return out.join(",");
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

      const newDates = datesBetween(start, end);
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
        const newDatesList = newDates.split(",").map(d => d.trim());
        
        console.log("Existing dates:", existingDates);
        console.log("New dates:", newDatesList);
        
        // Combine and remove duplicates
        const mergedDatesSet = new Set([...existingDates, ...newDatesList]);
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
