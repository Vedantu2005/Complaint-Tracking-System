import { useState, useEffect, useCallback } from 'react';
import { 
  AppData, 
  Complaint, 
  ComplaintFilters, 
  PaginationOptions,
  ComplaintStatus,
  HistoryEntry,
  Comment 
} from '@/types';
import { 
  loadFromStorage, 
  saveToStorage, 
  generateComplaintId,
} from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

export const useComplaintData = () => {
  // Initialize state directly from localStorage. This ensures the app starts
  // with the correct data, even after a page refresh.
  const [data, setData] = useState<AppData>(() => loadFromStorage());

  // This effect listens for storage changes made in other browser tabs,
  // keeping your application's data synchronized.
  useEffect(() => {
    const handleStorageChange = () => {
      setData(loadFromStorage());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // A centralized function to save data to storage and update the React state.
  const persistData = useCallback((newData: AppData) => {
    saveToStorage(newData);
    setData(newData);
  }, []);

  // Create a new complaint.
  const createComplaint = useCallback((complaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'comments'>) => {
    const now = Date.now();
    const newComplaint: Complaint = {
      ...complaintData,
      id: generateComplaintId(),
      createdAt: now,
      updatedAt: now,
      history: [{
        id: `hist_${now}`,
        timestamp: now,
        by: complaintData.reporter.name, // Use reporter's name
        action: 'Complaint Submitted',
        newStatus: 'New'
      }],
      comments: []
    };

    // Use a functional state update to prevent race conditions. This reads the
    // most current state right before updating it.
    setData(currentData => {
      const updatedData = {
        ...currentData,
        complaints: [...currentData.complaints, newComplaint]
      };
      saveToStorage(updatedData);
      return updatedData;
    });

    return newComplaint;
  }, []);

  // Get a single complaint by its ID.
  const getComplaintById = useCallback((id: string): Complaint | undefined => {
    // Read directly from storage to get the absolute latest data. This is crucial
    // for the tracking page, which loads immediately after a submission.
    const currentData = loadFromStorage();
    return currentData.complaints.find(c => c.id === id);
  }, []);
  
  // Update the status of an existing complaint.
  const updateComplaintStatus = useCallback((complaintId: string, newStatus: ComplaintStatus, note?: string, updatedBy: string = 'Admin') => {
      const currentData = loadFromStorage();
      const complaintIndex = currentData.complaints.findIndex(c => c.id === complaintId);
      
      if (complaintIndex === -1) return false;

      const complaint = currentData.complaints[complaintIndex];
      const now = Date.now();
      const historyEntry: HistoryEntry = {
          id: `hist_${now}`,
          timestamp: now,
          by: updatedBy,
          action: 'Status Updated',
          note,
          previousStatus: complaint.status,
          newStatus
      };

      const updatedComplaint = { ...complaint, status: newStatus, updatedAt: now, history: [...complaint.history, historyEntry] };
      currentData.complaints[complaintIndex] = updatedComplaint;
      
      persistData(currentData);
      toast({ title: "Status Updated", description: `Complaint status is now ${newStatus}.` });
      return true;
  }, [persistData]);

  // Filter and paginate complaints for the admin dashboard.
  const getFilteredComplaints = useCallback((filters: ComplaintFilters = {}, pagination?: PaginationOptions) => {
      const currentData = data; // Use the current React state for filtering
      if (!currentData) return { complaints: [], total: 0 };

      let filtered = [...currentData.complaints];

      // Apply search and filter criteria
      if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(c =>
              c.id.toLowerCase().includes(query) ||
              c.title.toLowerCase().includes(query) ||
              c.reporter.name.toLowerCase().includes(query)
          );
      }
      if (filters.status?.length) {
          filtered = filtered.filter(c => filters.status!.includes(c.status));
      }
      if (filters.category?.length) {
          filtered = filtered.filter(c => filters.category!.includes(c.category));
      }
      if (filters.priority?.length) {
          filtered = filtered.filter(c => filters.priority!.includes(c.priority));
      }
      
      const total = filtered.length;

      // Apply sorting
      if (pagination?.sortBy) {
          filtered.sort((a, b) => {
              const aVal = a[pagination!.sortBy!];
              const bVal = b[pagination!.sortBy!];
              if (aVal < bVal) return pagination.sortOrder === 'asc' ? -1 : 1;
              if (aVal > bVal) return pagination.sortOrder === 'asc' ? 1 : -1;
              return 0;
          });
      }

      // Apply pagination
      if (pagination) {
          const start = (pagination.page - 1) * pagination.limit;
          const paginated = filtered.slice(start, start + pagination.limit);
          return { complaints: paginated, total };
      }

      return { complaints: filtered, total };
  }, [data]);

  return {
    data,
    createComplaint,
    getComplaintById,
    updateComplaintStatus,
    getFilteredComplaints
  };
};

