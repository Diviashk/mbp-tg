import { useEffect, useState, useRef } from "react";
import WebApp from "@twa-dev/sdk";

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

  // store callbacks so we can unregister them properly
  const mainButtonCallbackRef = useRef<(() => void) | null>(null);
  const backButtonCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.enableClosingConfirmation();

    setIsReady(true);

    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user as TelegramUser);
    }

    // apply theme
    const theme = WebApp.themeParams;
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty("--tg-theme-bg-color", theme.bg_color || "#ffffff");
      root.style.setProperty("--tg-theme-text-color", theme.text_color || "#000000");
      root.style.setProperty("--tg-theme-hint-color", theme.hint_color || "#999999");
      root.style.setProperty("--tg-theme-link-color", theme.link_color || "#2481cc");
      root.style.setProperty("--tg-theme-button-color", theme.button_color || "#2481cc");
      root.style.setProperty("--tg-theme-button-text-color", theme.button_text_color || "#ffffff");
      root.style.setProperty("--tg-theme-secondary-bg-color", theme.secondary_bg_color || "#f4f4f4");
    }
  }, []);

  /** MAIN BUTTON **/
  const showMainButton = (text: string, onClick: () => void) => {
    // remove old callback first
    if (mainButtonCallbackRef.current) {
      WebApp.MainButton.offClick(mainButtonCallbackRef.current);
    }

    // set new callback
    mainButtonCallbackRef.current = onClick;

    WebApp.MainButton.setText(text);
    WebApp.MainButton.onClick(onClick);
    WebApp.MainButton.show();
  };

  const hideMainButton = () => {
    WebApp.MainButton.hide();
    if (mainButtonCallbackRef.current) {
      WebApp.MainButton.offClick(mainButtonCallbackRef.current);
      mainButtonCallbackRef.current = null;
    }
  };

  /** BACK BUTTON **/
  const showBackButton = (onClick: () => void) => {
    if (backButtonCallbackRef.current) {
      WebApp.BackButton.offClick(backButtonCallbackRef.current);
    }

    backButtonCallbackRef.current = onClick;

    WebApp.BackButton.onClick(onClick);
    WebApp.BackButton.show();
  };

  const hideBackButton = () => {
    WebApp.BackButton.hide();
    if (backButtonCallbackRef.current) {
      WebApp.BackButton.offClick(backButtonCallbackRef.current);
      backButtonCallbackRef.current = null;
    }
  };

  /** other helpers **/
  const hapticFeedback = {
    light: () => WebApp.HapticFeedback.impactOccurred("light"),
    medium: () => WebApp.HapticFeedback.impactOccurred("medium"),
    heavy: () => WebApp.HapticFeedback.impactOccurred("heavy"),
    success: () => WebApp.HapticFeedback.notificationOccurred("success"),
    warning: () => WebApp.HapticFeedback.notificationOccurred("warning"),
    error: () => WebApp.HapticFeedback.notificationOccurred("error"),
    selection: () => WebApp.HapticFeedback.selectionChanged(),
  };

  const showAlert = (msg: string) => WebApp.showAlert(msg);
  const showConfirm = (msg: string, cb: (confirmed: boolean) => void) =>
    WebApp.showConfirm(msg, cb);

  const close = () => WebApp.close();

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
