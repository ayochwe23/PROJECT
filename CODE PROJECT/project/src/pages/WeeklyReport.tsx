import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Save, Trash2 } from 'lucide-react';
import { WeeklyReport, WeeklyReportItem } from '../types';
import { addWeeklyReport } from '../services/reportService';

const WeeklyReportForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Get current week date range
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };
  
  const weekDates = getWeekDates();
  
  const [weekStartDate, setWeekStartDate] = useState(weekDates.start);
  const [weekEndDate, setWeekEndDate] = useState(weekDates.end);
  const [narrativeReport, setNarrativeReport] = useState('');
  const [reportItems, setReportItems] = useState<WeeklyReportItem[]>([
    {
      id: Date.now().toString(),
      userId: user?.id || '',
      date: new Date().toISOString().split('T')[0],
      task: '',
      problemEncountered: '',
      actionsTaken: '',
      observation: ''
    }
  ]);

  // Update userId when user changes
  useEffect(() => {
    if (user?.id) {
      setReportItems(items => 
        items.map(item => ({
          ...item,
          userId: user.id
        }))
      );
    }
  }, [user]);

  const handleAddItem = () => {
    setReportItems([
      ...reportItems,
      {
        id: Date.now().toString(),
        userId: user?.id || '',
        date: new Date().toISOString().split('T')[0],
        task: '',
        problemEncountered: '',
        actionsTaken: '',
        observation: ''
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (reportItems.length <= 1) {
      setError('You must have at least one report item');
      return;
    }
    setReportItems(reportItems.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof WeeklyReportItem, value: string) => {
    setReportItems(reportItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }
    
    // Validate all required fields
    const missingFields = reportItems.some(item => 
      !item.date || !item.task || !item.problemEncountered || !item.actionsTaken
    );
    
    if (missingFields) {
      setError('Please fill in all required fields in each report item');
      return;
    }
    
    if (!narrativeReport.trim()) {
      setError('Weekly narrative report is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const report: WeeklyReport = {
        id: Date.now().toString(),
        userId: user.id,
        weekStartDate,
        weekEndDate,
        narrativeReport,
        items: reportItems,
        submitted: true,
        submittedAt: new Date().toISOString()
      };
      
      await addWeeklyReport(report);
      setSuccess(true);
      
      // Reset form after submission
      setTimeout(() => {
        navigate('/reports');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Weekly Report Form">
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Weekly report submitted successfully! Redirecting...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Period</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weekStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Week Start Date*
                </label>
                <input
                  type="date"
                  id="weekStartDate"
                  value={weekStartDate}
                  onChange={(e) => setWeekStartDate(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="weekEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Week End Date*
                </label>
                <input
                  type="date"
                  id="weekEndDate"
                  value={weekEndDate}
                  onChange={(e) => setWeekEndDate(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Report Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} className="mr-1" />
                Add Item
              </button>
            </div>
            
            {reportItems.map((item, index) => (
              <div key={item.id} className="mb-6 pb-6 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-900">Item #{index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Trash2 size={16} className="mr-1 text-red-500" />
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor={`date-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      id={`date-${item.id}`}
                      value={item.date}
                      onChange={(e) => handleItemChange(item.id, 'date', e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor={`task-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Tasks*
                    </label>
                    <input
                      type="text"
                      id={`task-${item.id}`}
                      value={item.task}
                      onChange={(e) => handleItemChange(item.id, 'task', e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter tasks performed"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor={`problem-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Problem Encountered*
                  </label>
                  <textarea
                    id={`problem-${item.id}`}
                    value={item.problemEncountered}
                    onChange={(e) => handleItemChange(item.id, 'problemEncountered', e.target.value)}
                    rows={2}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe any problems encountered"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor={`actions-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Actions Taken*
                  </label>
                  <textarea
                    id={`actions-${item.id}`}
                    value={item.actionsTaken}
                    onChange={(e) => handleItemChange(item.id, 'actionsTaken', e.target.value)}
                    rows={2}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe actions taken to address problems"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor={`observation-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Observation
                  </label>
                  <textarea
                    id={`observation-${item.id}`}
                    value={item.observation}
                    onChange={(e) => handleItemChange(item.id, 'observation', e.target.value)}
                    rows={2}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add any observations or notes"
                  ></textarea>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Narrative Report</h2>
            <div>
              <label htmlFor="narrativeReport" className="block text-sm font-medium text-gray-700 mb-1">
                Write a comprehensive summary of the week*
              </label>
              <textarea
                id="narrativeReport"
                value={narrativeReport}
                onChange={(e) => setNarrativeReport(e.target.value)}
                rows={6}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Provide a detailed narrative of your work, accomplishments, and learning for the week..."
                required
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </Layout>
  );
};

export default WeeklyReportForm;