
import { DownloadCount } from './types';

export const secureStorage = {
  set: (key: string, value: any): void => {
    try {
      const encodedValue = btoa(JSON.stringify(value));
      localStorage.setItem(`secure_${key}`, encodedValue);
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement des données sécurisées pour ${key}:`, error);
    }
  },
  
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const storedValue = localStorage.getItem(`secure_${key}`);
      if (!storedValue) return defaultValue;
      
      const decodedValue = JSON.parse(atob(storedValue));
      return decodedValue as T;
    } catch (error) {
      console.error(`Erreur lors de la récupération des données sécurisées pour ${key}:`, error);
      return defaultValue;
    }
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  }
};

// CV storage functions
export const saveCVs = (cvs: any[]): void => {
  localStorage.setItem('saved_cvs', JSON.stringify(cvs));
  secureStorage.set('saved_cvs_backup', cvs);
};

export const getSavedCVs = (): any[] => {
  const savedCVsJSON = localStorage.getItem('saved_cvs');
  if (savedCVsJSON) {
    try {
      return JSON.parse(savedCVsJSON);
    } catch (e) {
      console.error("Erreur lors de la récupération des CV:", e);
      return [];
    }
  }
  return [];
};
