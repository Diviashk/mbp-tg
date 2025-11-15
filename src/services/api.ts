import { Absence, ShiftPreference, Employee } from '../types';

// TODO: Replace with your actual FastAPI backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-fastapi-backend.com/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Employee endpoints
  async getEmployee(telegramUserId: number): Promise<Employee> {
    return this.request<Employee>(`/employees/telegram/${telegramUserId}`);
  }

  async getUpcomingShifts(employeeId: string): Promise<Employee['upcomingShifts']> {
    return this.request(`/employees/${employeeId}/shifts/upcoming`);
  }

  // Absence endpoints
  async submitAbsence(absence: Absence): Promise<{ success: boolean; message: string }> {
    return this.request('/absences', {
      method: 'POST',
      body: JSON.stringify(absence),
    });
  }

  async getAbsences(employeeId: string): Promise<Absence[]> {
    return this.request(`/employees/${employeeId}/absences`);
  }

  // Preference endpoints
  async updatePreferences(
    employeeId: string,
    preferences: ShiftPreference[]
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/employees/${employeeId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  }

  async getPreferences(employeeId: string): Promise<ShiftPreference[]> {
    return this.request(`/employees/${employeeId}/preferences`);
  }
}

export const apiService = new ApiService();
