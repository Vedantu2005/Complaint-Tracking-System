// Local storage persistence layer for the Complaint Tracking System
// This handles all data storage/retrieval with localStorage as primary and IndexedDB as fallback

import { AppData, Complaint, ComplaintCategory, ComplaintStatus, Priority } from '@/types';

const STORAGE_KEY = 'cts_data_v1';
const STORAGE_VERSION = '1.0.0';

// Generate sample data for first-time users
const generateSampleData = (): AppData => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return {
    complaints: [
      {
        id: generateComplaintId(),
        title: 'Blocked storm drain on Main Street',
        description: 'The storm drain near 123 Main Street has been blocked for several days, causing water to pool during rain. This creates a safety hazard for pedestrians and vehicles.',
        category: 'Sanitation' as ComplaintCategory,
        priority: 'High' as Priority,
        status: 'In Review' as ComplaintStatus,
        createdAt: now - (2 * dayMs),
        updatedAt: now - dayMs,
        location: '123 Main Street, Downtown',
        reporter: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1-555-0123',
          preferredContact: 'email'
        },
        assignee: 'Sarah Johnson',
        attachments: [],
        history: [
          {
            id: 'hist_1',
            timestamp: now - (2 * dayMs),
            by: 'System',
            action: 'Complaint submitted',
            newStatus: 'New'
          },
          {
            id: 'hist_2',
            timestamp: now - dayMs,
            by: 'Sarah Johnson',
            action: 'Status updated',
            note: 'Assigned to maintenance team for inspection',
            previousStatus: 'New',
            newStatus: 'In Review'
          }
        ],
        comments: [
          {
            id: 'comm_1',
            by: 'Sarah Johnson',
            text: 'We have received your complaint and dispatched a team to assess the situation. Expected resolution within 3-5 business days.',
            timestamp: now - dayMs,
            isPrivate: false
          }
        ],
        tags: ['infrastructure', 'safety']
      },
      {
        id: generateComplaintId(),
        title: 'Streetlight not working',
        description: 'The streetlight at the corner of Oak and Pine has been out for over a week, making the area unsafe at night.',
        category: 'Public Safety' as ComplaintCategory,
        priority: 'Medium' as Priority,
        status: 'New' as ComplaintStatus,
        createdAt: now - dayMs,
        updatedAt: now - dayMs,
        location: 'Corner of Oak St and Pine Ave',
        reporter: {
          name: 'Maria Garcia',
          email: 'maria.garcia@email.com',
          preferredContact: 'email'
        },
        attachments: [],
        history: [
          {
            id: 'hist_3',
            timestamp: now - dayMs,
            by: 'System',
            action: 'Complaint submitted',
            newStatus: 'New'
          }
        ],
        comments: [],
        tags: ['lighting', 'safety']
      }
    ],
    users: [
      {
        id: 'admin_1',
        name: 'Sarah Johnson',
        email: 'admin@city.gov',
        role: 'admin'
      },
      {
        id: 'admin_2',
        name: 'Michael Chen',
        email: 'supervisor@city.gov',
        role: 'admin'
      }
    ],
    settings: {
      version: STORAGE_VERSION,
      notifications: true,
      theme: 'system'
    },
    version: STORAGE_VERSION,
    lastModified: now
  };
};

// Generate unique complaint ID in format CT-YYYYMMDD-XXXX
export const generateComplaintId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `CT-${year}${month}${day}-${randomNum}`;
};

// Check if localStorage is available
const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Primary storage functions using localStorage
export const saveToStorage = (data: AppData): boolean => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, data will not persist');
      return false;
    }

    const serializedData = JSON.stringify({
      ...data,
      lastModified: Date.now()
    });
    
    localStorage.setItem(STORAGE_KEY, serializedData);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

export const loadFromStorage = (): AppData => {
  try {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, using sample data');
      return generateSampleData();
    }

    const serializedData = localStorage.getItem(STORAGE_KEY);
    
    if (!serializedData) {
      console.info('No existing data found, initializing with sample data');
      const sampleData = generateSampleData();
      saveToStorage(sampleData);
      return sampleData;
    }

    const data = JSON.parse(serializedData) as AppData;
    
    // Validate data structure and version
    if (!data.version || data.version !== STORAGE_VERSION) {
      console.warn('Data version mismatch, regenerating sample data');
      const sampleData = generateSampleData();
      saveToStorage(sampleData);
      return sampleData;
    }

    return data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    const sampleData = generateSampleData();
    saveToStorage(sampleData);
    return sampleData;
  }
};

// Clear all stored data
export const clearStorage = (): boolean => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
};

// Export data as JSON string for backup
export const exportData = (): string => {
  const data = loadFromStorage();
  return JSON.stringify(data, null, 2);
};

// Import data from JSON string
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData) as AppData;
    
    // Basic validation
    if (!data.complaints || !Array.isArray(data.complaints)) {
      throw new Error('Invalid data format: missing complaints array');
    }
    
    if (!data.users || !Array.isArray(data.users)) {
      throw new Error('Invalid data format: missing users array');
    }

    // Ensure data has current version
    data.version = STORAGE_VERSION;
    data.settings = {
      ...data.settings,
      version: STORAGE_VERSION
    };

    return saveToStorage(data);
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

// Get storage usage info
export const getStorageInfo = () => {
  if (!isLocalStorageAvailable()) {
    return { used: 0, available: 0, supported: false };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const used = data ? new Blob([data]).size : 0;
    
    // Rough estimate of localStorage limit (usually 5-10MB)
    const estimated_limit = 5 * 1024 * 1024; // 5MB
    
    return {
      used,
      available: estimated_limit - used,
      supported: true,
      usedFormatted: formatBytes(used),
      availableFormatted: formatBytes(estimated_limit - used)
    };
  } catch (error) {
    return { used: 0, available: 0, supported: false };
  }
};

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// TODO: IndexedDB fallback implementation for large attachments
// This would be useful for storing file attachments when localStorage hits limits
export const initIndexedDB = async (): Promise<boolean> => {
  // Placeholder for IndexedDB implementation
  // Would handle larger files and provide better performance for complex queries
  console.info('IndexedDB fallback not yet implemented');
  return false;
};