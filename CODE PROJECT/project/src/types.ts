// User types
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  createdAt: string;
  department?: string;
  supervisor?: string;
  position?: string;
  contactNumber?: string;
  startDate?: string;
  endDate?: string;
  requiredHours?: number;
}

// Time entry types
export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  totalHours: number | null;
  targetHours: number;
  percentage: number | null;
  status: 'in-progress' | 'completed';
}

// Report types
export interface WeeklyReportItem {
  id: string;
  userId: string;
  date: string;
  task: string;
  problemEncountered: string;
  actionsTaken: string;
  observation: string;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  narrativeReport: string;
  items: WeeklyReportItem[];
  submitted: boolean;
  submittedAt?: string;
}

// Survey types
export interface SurveyResponse {
  id: string;
  userId: string;
  date: string;
  sameDepartment: boolean;
  newDepartment?: string;
  newJobDescription?: string;
  underwentOrientation: boolean;
  skillAcquisitionMethod?: string;
  problemEncountered: {
    onTheJob: boolean;
    againstSuperior: boolean;
    participatingCompany: boolean;
    others: boolean;
    description?: string;
  };
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
  important: boolean;
}