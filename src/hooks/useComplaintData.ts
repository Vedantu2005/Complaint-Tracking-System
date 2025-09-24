// React hook for complaint data management
// Provides CRUD operations and real-time data management

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
  clearStorage,
  exportData,
  importData 
} from '@/utils/storage';
import { toast } from '@/hooks/use-toast';

export const useComplaintData = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    try {
      const loadedData = loadFromStorage();
      setData(loadedData);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data whenever it changes
  const persistData = useCallback((newData: AppData) => {
    const success = saveToStorage(newData);
    if (!success) {
      setError('Failed to save data');
      toast({
        title: "Save Error",
        description: "Failed to save data to local storage",
        variant: "destructive"
      });
    }
    return success;
  }, []);

  // Create a new complaint
  const createComplaint = useCallback((complaintData: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'comments'>) => {
    if (!data) return null;

    const now = Date.now();
    const id = generateComplaintId();
    
    const newComplaint: Complaint = {
      ...complaintData,
      id,
      createdAt: now,
      updatedAt: now,
      history: [{
        id: `hist_${Date.now()}`,
        timestamp: now,
        by: 'System',
        action: 'Complaint submitted',
        newStatus: complaintData.status
      }],
      comments: []
    };

    const updatedData = {
      ...data,
      complaints: [...data.complaints, newComplaint],
      lastModified: now
    };

    setData(updatedData);
    persistData(updatedData);

    toast({
      title: "Complaint Submitted",
      description: `Your complaint has been submitted with ID: ${id}`
    });

    return newComplaint;
  }, [data, persistData]);

  // Update complaint status
  const updateComplaintStatus = useCallback((
    complaintId: string, 
    newStatus: ComplaintStatus, 
    note?: string, 
    updatedBy: string = 'Admin'
  ) => {
    if (!data) return false;

    const complaintIndex = data.complaints.findIndex(c => c.id === complaintId);
    if (complaintIndex === -1) return false;

    const complaint = data.complaints[complaintIndex];
    const now = Date.now();

    const historyEntry: HistoryEntry = {
      id: `hist_${now}`,
      timestamp: now,
      by: updatedBy,
      action: 'Status updated',
      note,
      previousStatus: complaint.status,
      newStatus
    };

    const updatedComplaint = {
      ...complaint,
      status: newStatus,
      updatedAt: now,
      history: [...complaint.history, historyEntry]
    };

    const updatedComplaints = [...data.complaints];
    updatedComplaints[complaintIndex] = updatedComplaint;

    const updatedData = {
      ...data,
      complaints: updatedComplaints,
      lastModified: now
    };

    setData(updatedData);
    persistData(updatedData);

    toast({
      title: "Status Updated",
      description: `Complaint ${complaintId} status changed to ${newStatus}`
    });

    return true;
  }, [data, persistData]);

  // Add comment to complaint
  const addComment = useCallback((
    complaintId: string,
    text: string,
    by: string,
    isPrivate: boolean = false
  ) => {
    if (!data) return false;

    const complaintIndex = data.complaints.findIndex(c => c.id === complaintId);
    if (complaintIndex === -1) return false;

    const now = Date.now();
    const newComment: Comment = {
      id: `comm_${now}`,
      by,
      text,
      timestamp: now,
      isPrivate
    };

    const complaint = data.complaints[complaintIndex];
    const updatedComplaint = {
      ...complaint,
      comments: [...complaint.comments, newComment],
      updatedAt: now
    };

    const updatedComplaints = [...data.complaints];
    updatedComplaints[complaintIndex] = updatedComplaint;

    const updatedData = {
      ...data,
      complaints: updatedComplaints,
      lastModified: now
    };

    setData(updatedData);
    persistData(updatedData);

    return true;
  }, [data, persistData]);

  // Get complaint by ID
  const getComplaintById = useCallback((id: string): Complaint | null => {
    if (!data) return null;
    return data.complaints.find(c => c.id === id) || null;
  }, [data]);

  // Filter and paginate complaints
  const getFilteredComplaints = useCallback((
    filters: ComplaintFilters = {},
    pagination?: PaginationOptions
  ) => {
    if (!data) return { complaints: [], total: 0 };

    let filtered = [...data.complaints];

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(c => filters.status!.includes(c.status));
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(c => filters.category!.includes(c.category));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(c => filters.priority!.includes(c.priority));
    }

    if (filters.assignee && filters.assignee.length > 0) {
      filtered = filtered.filter(c => c.assignee && filters.assignee!.includes(c.assignee));
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.reporter.name.toLowerCase().includes(query)
      );
    }

    if (filters.dateRange) {
      const start = filters.dateRange.start.getTime();
      const end = filters.dateRange.end.getTime();
      filtered = filtered.filter(c => c.createdAt >= start && c.createdAt <= end);
    }

    // Apply sorting
    if (pagination) {
      filtered.sort((a, b) => {
        const aVal = a[pagination.sortBy];
        const bVal = b[pagination.sortBy];
        
        if (aVal < bVal) return pagination.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return pagination.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // Apply pagination
      const start = (pagination.page - 1) * pagination.limit;
      const paginatedComplaints = filtered.slice(start, start + pagination.limit);
      
      return {
        complaints: paginatedComplaints,
        total: filtered.length
      };
    }

    return {
      complaints: filtered,
      total: filtered.length
    };
  }, [data]);

  // Get analytics data
  const getAnalyticsData = useCallback(() => {
    if (!data) return null;

    const complaints = data.complaints;
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    return {
      total: complaints.length,
      byStatus: complaints.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<ComplaintStatus, number>),
      byCategory: complaints.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: complaints.reduce((acc, c) => {
        acc[c.priority] = (acc[c.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: complaints.filter(c => c.createdAt > thirtyDaysAgo).length,
      avgResolutionTime: calculateAverageResolutionTime(complaints)
    };
  }, [data]);

  // Clear all data
  const resetData = useCallback(() => {
    const success = clearStorage();
    if (success) {
      // Reload fresh data
      const freshData = loadFromStorage();
      setData(freshData);
      toast({
        title: "Data Reset",
        description: "All data has been cleared and reset to defaults"
      });
    }
    return success;
  }, []);

  // Export data
  const handleExportData = useCallback(() => {
    try {
      const jsonData = exportData();
      return jsonData;
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to export data",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  // Import data
  const handleImportData = useCallback((jsonData: string) => {
    const success = importData(jsonData);
    if (success) {
      const newData = loadFromStorage();
      setData(newData);
      toast({
        title: "Import Successful",
        description: "Data has been imported successfully"
      });
    } else {
      toast({
        title: "Import Error",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive"
      });
    }
    return success;
  }, []);

  return {
    data,
    loading,
    error,
    // CRUD operations
    createComplaint,
    updateComplaintStatus,
    addComment,
    getComplaintById,
    getFilteredComplaints,
    // Analytics
    getAnalyticsData,
    // Data management
    resetData,
    handleExportData,
    handleImportData
  };
};

// Helper function to calculate average resolution time
const calculateAverageResolutionTime = (complaints: Complaint[]): number => {
  const resolvedComplaints = complaints.filter(c => 
    c.status === 'Resolved' || c.status === 'Rejected'
  );

  if (resolvedComplaints.length === 0) return 0;

  const totalTime = resolvedComplaints.reduce((sum, complaint) => {
    return sum + (complaint.updatedAt - complaint.createdAt);
  }, 0);

  return Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24)); // Days
};