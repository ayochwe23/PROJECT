import { Announcement } from '../types';

// Get all announcements
export const getAnnouncements = async (): Promise<Announcement[]> => {
  try {
    // In a real application, this would be an API call
    const storedAnnouncements = localStorage.getItem('ojtAnnouncements');
    const allAnnouncements: Announcement[] = storedAnnouncements ? JSON.parse(storedAnnouncements) : [];
    
    // Sort by date (newest first) and prioritize important announcements
    return allAnnouncements.sort((a, b) => {
      // Important announcements first
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;
      
      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

// Add a new announcement
export const addAnnouncement = async (announcement: Announcement): Promise<Announcement> => {
  try {
    const storedAnnouncements = localStorage.getItem('ojtAnnouncements');
    const allAnnouncements: Announcement[] = storedAnnouncements ? JSON.parse(storedAnnouncements) : [];
    
    // Add new announcement
    allAnnouncements.push(announcement);
    
    // Save to local storage
    localStorage.setItem('ojtAnnouncements', JSON.stringify(allAnnouncements));
    
    return announcement;
  } catch (error) {
    console.error('Error adding announcement:', error);
    throw error;
  }
};

// Update an existing announcement
export const updateAnnouncement = async (updatedAnnouncement: Announcement): Promise<Announcement> => {
  try {
    const storedAnnouncements = localStorage.getItem('ojtAnnouncements');
    const allAnnouncements: Announcement[] = storedAnnouncements ? JSON.parse(storedAnnouncements) : [];
    
    // Find and update the announcement
    const updatedAnnouncements = allAnnouncements.map(announcement => 
      announcement.id === updatedAnnouncement.id ? updatedAnnouncement : announcement
    );
    
    // Save to local storage
    localStorage.setItem('ojtAnnouncements', JSON.stringify(updatedAnnouncements));
    
    return updatedAnnouncement;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};