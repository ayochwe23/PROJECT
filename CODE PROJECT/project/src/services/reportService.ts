import { WeeklyReport } from '../types';

// Get weekly reports for a specific user
export const getWeeklyReports = async (userId: string): Promise<WeeklyReport[]> => {
  try {
    // In a real application, this would be an API call
    const storedReports = localStorage.getItem('ojtWeeklyReports');
    const allReports: WeeklyReport[] = storedReports ? JSON.parse(storedReports) : [];
    
    // Filter reports for this user and sort by date (newest first)
    return allReports
      .filter(report => report.userId === userId)
      .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
  } catch (error) {
    console.error('Error fetching weekly reports:', error);
    return [];
  }
};

// Get all weekly reports (admin only)
export const getAllWeeklyReports = async (): Promise<WeeklyReport[]> => {
  try {
    const storedReports = localStorage.getItem('ojtWeeklyReports');
    const allReports: WeeklyReport[] = storedReports ? JSON.parse(storedReports) : [];
    
    // Sort by date (newest first)
    return allReports.sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime());
  } catch (error) {
    console.error('Error fetching all weekly reports:', error);
    return [];
  }
};

// Add a new weekly report
export const addWeeklyReport = async (report: WeeklyReport): Promise<WeeklyReport> => {
  try {
    const storedReports = localStorage.getItem('ojtWeeklyReports');
    const allReports: WeeklyReport[] = storedReports ? JSON.parse(storedReports) : [];
    
    // Add new report
    allReports.push(report);
    
    // Save to local storage
    localStorage.setItem('ojtWeeklyReports', JSON.stringify(allReports));
    
    return report;
  } catch (error) {
    console.error('Error adding weekly report:', error);
    throw error;
  }
};

// Update an existing weekly report
export const updateWeeklyReport = async (updatedReport: WeeklyReport): Promise<WeeklyReport> => {
  try {
    const storedReports = localStorage.getItem('ojtWeeklyReports');
    const allReports: WeeklyReport[] = storedReports ? JSON.parse(storedReports) : [];
    
    // Find and update the report
    const updatedReports = allReports.map(report => 
      report.id === updatedReport.id ? updatedReport : report
    );
    
    // Save to local storage
    localStorage.setItem('ojtWeeklyReports', JSON.stringify(updatedReports));
    
    return updatedReport;
  } catch (error) {
    console.error('Error updating weekly report:', error);
    throw error;
  }
};