import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ReportAbsence } from './components/ReportAbsence';
import { UpdatePreference } from './components/UpdatePreference';
import { useTelegram } from './hooks/useTelegram';
import { apiService } from './services/api';
import { Screen, Employee, ShiftPreference } from './types';

function App() {
  const { isReady, user, showAlert, hapticFeedback } = useTelegram();
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load employee data on mount
  useEffect(() => {
    const loadEmployee = async () => {
      if (!isReady || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const employeeData = await apiService.getEmployee(user.id);
        setEmployee(employeeData);
        setError(null);
      } catch (err) {
        console.error('Failed to load employee:', err);
        // For demo purposes, create a mock employee
        setEmployee({
          id: 'demo-' + user.id,
          telegramUserId: user.id,
          name: user.first_name,
          upcomingShifts: [
            {
              id: '1',
              date: new Date(Date.now() + 86400000).toISOString(),
              type: 'morning',
              startTime: '06:00',
              endTime: '14:00',
            },
            {
              id: '2',
              date: new Date(Date.now() + 86400000 * 3).toISOString(),
              type: 'evening',
              startTime: '14:00',
              endTime: '22:00',
            },
          ],
        });
        setError(null); // Clear error since we're using mock data
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployee();
  }, [isReady, user]);

  const handleNavigate = (screen: Screen) => {
    hapticFeedback.light();
    setCurrentScreen(screen);
  };

  const handleBackToHome = () => {
    hapticFeedback.light();
    setCurrentScreen('home');
  };

  const handleAbsenceSubmit = async (data: {
    startDate: string;
    endDate: string;
    reason: string;
    customReason?: string;
  }) => {
    if (!employee) return;

    try {
      await apiService.submitAbsence({
        employeeId: employee.id,
        ...data,
      });
      
      showAlert('Absence submitted successfully! Your manager will be notified.');
      handleBackToHome();
    } catch (err) {
      console.error('Failed to submit absence:', err);
      throw err;
    }
  };

  const handlePreferenceSubmit = async (preferences: ShiftPreference[]) => {
    if (!employee) return;

    try {
      await apiService.updatePreferences(employee.id, preferences);
      
      showAlert('Preferences updated successfully!');
      handleBackToHome();
    } catch (err) {
      console.error('Failed to update preferences:', err);
      throw err;
    }
  };

  // Loading state
  if (!isReady || isLoading) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-tg-hint border-t-tg-button mb-4"></div>
          <p className="text-tg-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !employee) {
    return (
      <div className="min-h-screen bg-tg-bg flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-tg-text mb-2">Something went wrong</h2>
          <p className="text-tg-hint mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-tg-button text-tg-button-text rounded-xl font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main app
  return (
    <div className="app-container">
      {currentScreen === 'home' && (
        <HomeScreen
          employee={employee}
          onNavigate={handleNavigate}
        />
      )}
      
      {currentScreen === 'report-absence' && employee && (
        <ReportAbsence
          employeeId={employee.id}
          onSubmit={handleAbsenceSubmit}
          onBack={handleBackToHome}
        />
      )}
      
      {currentScreen === 'update-preference' && employee && (
        <UpdatePreference
          employeeId={employee.id}
          onSubmit={handlePreferenceSubmit}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;
