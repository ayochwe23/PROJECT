import { SurveyResponse } from '../types';

// Get survey responses for a specific user
export const getSurveyResponses = async (userId: string): Promise<SurveyResponse[]> => {
  try {
    // In a real application, this would be an API call
    const storedResponses = localStorage.getItem('ojtSurveyResponses');
    const allResponses: SurveyResponse[] = storedResponses ? JSON.parse(storedResponses) : [];
    
    // Filter responses for this user and sort by date (newest first)
    return allResponses
      .filter(response => response.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    return [];
  }
};

// Get all survey responses (admin only)
export const getAllSurveyResponses = async (): Promise<SurveyResponse[]> => {
  try {
    const storedResponses = localStorage.getItem('ojtSurveyResponses');
    const allResponses: SurveyResponse[] = storedResponses ? JSON.parse(storedResponses) : [];
    
    // Sort by date (newest first)
    return allResponses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching all survey responses:', error);
    return [];
  }
};

// Add a new survey response
export const addSurveyResponse = async (response: SurveyResponse): Promise<SurveyResponse> => {
  try {
    const storedResponses = localStorage.getItem('ojtSurveyResponses');
    const allResponses: SurveyResponse[] = storedResponses ? JSON.parse(storedResponses) : [];
    
    // Add new response
    allResponses.push(response);
    
    // Save to local storage
    localStorage.setItem('ojtSurveyResponses', JSON.stringify(allResponses));
    
    return response;
  } catch (error) {
    console.error('Error adding survey response:', error);
    throw error;
  }
};