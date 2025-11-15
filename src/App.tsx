import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ReportAbsence } from './components/ReportAbsence';
import { useTelegram } from './hooks/useTelegram';
import { apiService } from './services/api';
import { Screen, Employee } from './types';

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
        setError('Could not load your employee profile. Please contact your manager to link your Telegram account.');
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
          <h2 className="text-xl font-bold text-tg-text mb-2">Account Not Linked</h2>
          <p className="text-tg-hint mb-6">{error}</p>
          <div className="bg-tg-secondary-bg rounded-xl p-4">
            <p className="text-sm text-tg-text mb-2">
              <strong>Your Telegram ID:</strong>
            </p>
            <p className="text-lg font-mono text-tg-button mb-3">{user?.id}</p>
            <p className="text-xs text-tg-hint">
              Share this ID with your manager to link your account.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-tg-button text-tg-button-text rounded-xl font-medium"
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
    </div>
  );
}

export default App;
