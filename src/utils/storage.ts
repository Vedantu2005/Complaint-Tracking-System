import { AppData } from '@/types';

// The single, consistent key for localStorage.
const STORAGE_KEY = 'police_complaint_system_data';
const STORAGE_VERSION = '1.0.2'; // Updated version to force reset

// Generate a unique complaint ID in the format CT-YYYYMMDD-XXXX
export const generateComplaintId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `CT-${year}${month}${day}-${randomNum}`;
};

// Start with a clean slate
const generateInitialData = (): AppData => ({
  complaints: [],
  users: [],
  settings: { version: STORAGE_VERSION, notifications: true, theme: 'system' },
  version: STORAGE_VERSION,
  lastModified: Date.now()
});

// Save the entire application state to localStorage
export const saveToStorage = (data: AppData): void => {
  try {
    const dataToSave = { ...data, version: STORAGE_VERSION, lastModified: Date.now() };
    const serializedData = JSON.stringify(dataToSave);
    localStorage.setItem(STORAGE_KEY, serializedData);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Load the application state from localStorage
export const loadFromStorage = (): AppData => {
  try {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData) {
      const data = JSON.parse(serializedData) as AppData;
      // If version mismatches, reset to initial data
      if (data.version === STORAGE_VERSION) {
        return data;
      }
    }
    // If no data, or version is wrong, start fresh
    const initialData = generateInitialData();
    saveToStorage(initialData);
    return initialData;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return generateInitialData();
  }
};

