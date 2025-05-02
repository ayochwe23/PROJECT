import { TimeEntry, User, DEFAULT_REQUIRED_HOURS } from '../types';

// Get time entries for a specific user
export const getTimeEntries = async (userId: string): Promise<TimeEntry[]> => {
  try {
    // In a real application, this would be an API call
    const storedEntries = localStorage.getItem('ojtTimeEntries');
    const allEntries: TimeEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
    
    // Filter entries for this user and sort by date (newest first)
    return allEntries
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return [];
  }
};

// Calculate total completed hours for a user
export const calculateTotalHours = (entries: TimeEntry[]): number => {
  return entries
    .filter(entry => entry.status === 'completed')
    .reduce((total, entry) => total + (entry.totalHours || 0), 0);
};

// Calculate overall completion percentage
export const calculateOverallProgress = (totalHours: number, user?: User | null): number => {
  if (!user?.requiredHours) return 0;
  return Math.min(100, (totalHours / user.requiredHours) * 100);
};

// Calculate required hours based on date range
export const calculateRequiredHours = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate required hours (8 hours per working day, assuming 5 working days per week)
  const weeks = Math.ceil(diffDays / 7);
  const workingDays = weeks * 5;
  return workingDays * 8;
};

// Get all time entries (admin only)
export const getAllTimeEntries = async (): Promise<TimeEntry[]> => {
  try {
    const storedEntries = localStorage.getItem('ojtTimeEntries');
    const allEntries: TimeEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
    
    // Sort by date (newest first)
    return allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching all time entries:', error);
    return [];
  }
};

// Add a new time entry
export const addTimeEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
  try {
    const storedEntries = localStorage.getItem('ojtTimeEntries');
    const allEntries: TimeEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
    
    // Add new entry
    allEntries.push(entry);
    
    // Save to local storage
    localStorage.setItem('ojtTimeEntries', JSON.stringify(allEntries));
    
    return entry;
  } catch (error) {
    console.error('Error adding time entry:', error);
    throw error;
  }
};

// Update an existing time entry
export const updateTimeEntry = async (updatedEntry: TimeEntry): Promise<TimeEntry> => {
  try {
    const storedEntries = localStorage.getItem('ojtTimeEntries');
    const allEntries: TimeEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
    
    // Find and update the entry
    const updatedEntries = allEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    
    // Save to local storage
    localStorage.setItem('ojtTimeEntries', JSON.stringify(updatedEntries));
    
    return updatedEntry;
  } catch (error) {
    console.error('Error updating time entry:', error);
    throw error;
  }
};