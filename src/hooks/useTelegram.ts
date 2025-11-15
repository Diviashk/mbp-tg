import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();
    WebApp.enableClosingConfirmation();

    // Set app as ready
    setIsReady(true);

    // Get user info
    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user as TelegramUser);
    }

    // Apply theme colors to CSS variables
    const themeParams = WebApp.themeParams;
    if (themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999');
      document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#2481cc');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color || '#f4f4f4');
    }
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.show();
    WebApp.MainButton.onClick(onClick);
  };

  const hideMainButton = () => {
    WebApp.MainButton.hide();
    WebApp.MainButton.offClick(() => {});
  };

  const showBackButton = (onClick: () => void) => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onClick);
  };

  const hideBackButton = () => {
    WebApp.BackButton.hide();
    WebApp.BackButton.offClick(() => {});
  };

  const hapticFeedback = {
    light: () => WebApp.HapticFeedback.impactOccurred('light'),
    medium: () => WebApp.HapticFeedback.impactOccurred('medium'),
    heavy: () => WebApp.HapticFeedback.impactOccurred('heavy'),
    success: () => WebApp.HapticFeedback.notificationOccurred('success'),
    warning: () => WebApp.HapticFeedback.notificationOccurred('warning'),
    error: () => WebApp.HapticFeedback.notificationOccurred('error'),
    selection: () => WebApp.HapticFeedback.selectionChanged(),
  };

  const showAlert = (message: string) => {
    WebApp.showAlert(message);
  };

  const showConfirm = (message: string, callback: (confirmed: boolean) => void) => {
    WebApp.showConfirm(message, callback);
  };

  const close = () => {
    WebApp.close();
  };

  return {
    isReady,
    user,
    webApp: WebApp,
    themeParams: WebApp.themeParams,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    showAlert,
    showConfirm,
    close,
  };
};
