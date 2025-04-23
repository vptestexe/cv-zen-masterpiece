
import { useState, useEffect } from "react";

export const useSessionTimeout = (
  isAuthenticated: boolean,
  isLoading: boolean,
  onTimeout: () => void
) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  useEffect(() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    
    const checkSession = () => {
      const currentTime = Date.now();
      if (currentTime - lastActivity > SESSION_TIMEOUT) {
        onTimeout();
      }
    };
    
    const sessionTimer = setInterval(checkSession, 60000);
    
    const resetTimer = () => {
      setLastActivity(Date.now());
    };
    
    window.addEventListener('click', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('mousemove', resetTimer);
    
    return () => {
      clearInterval(sessionTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('mousemove', resetTimer);
    };
  }, [lastActivity, onTimeout]);

  return { lastActivity, setLastActivity };
};
