// Core types for the Complaint Tracking System

export type ComplaintStatus = 'New' | 'In Review' | 'Resolved' | 'Rejected';

export type ComplaintCategory = 
  | 'Sanitation'
  | 'Roads & Infrastructure'
  | 'Utilities'
  | 'Public Safety'
  | 'Parks & Recreation'
  | 'Housing'
  | 'Noise'
  | 'Other';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Attachment {
  id: string;
  name: string;
  mime: string;
  base64: string;
  size: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  by: string;
  action: string;
  note?: string;
  previousStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
}

export interface Comment {
  id: string;
  by: string;
  text: string;
  timestamp: number;
  isPrivate: boolean; // Admin-only comments
}

export interface Reporter {
  name: string;
  email: string;
  phone?: string;
  preferredContact: 'email' | 'phone';
}

export interface Complaint {
  id: string; // Format: CT-YYYYMMDD-XXXX
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  createdAt: number;
  updatedAt: number;
  location?: string;
  reporter: Reporter;
  assignee?: string;
  attachments: Attachment[];
  history: HistoryEntry[];
  comments: Comment[];
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'citizen';
}

export interface AppSettings {
  version: string;
  lastBackup?: number;
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface AppData {
  complaints: Complaint[];
  users: User[];
  settings: AppSettings;
  lastModified: number;
  version: string; // Add version to AppData
}

// Filter types for admin dashboard
export interface ComplaintFilters {
  status?: ComplaintStatus[];
  category?: ComplaintCategory[];
  priority?: Priority[];
  assignee?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: keyof Complaint;
  sortOrder: 'asc' | 'desc';
}