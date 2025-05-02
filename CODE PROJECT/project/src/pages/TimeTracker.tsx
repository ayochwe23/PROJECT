import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { TimeEntry } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getTimeEntries, addTimeEntry, updateTimeEntry, calculateTotalHours, calculateOverallProgress } from '../services/timeService';

const TimeTracker: React.FC = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState<TimeEntry | null>(null);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [targetHours, setTargetHours] = useState(8);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [totalCompletedHours, setTotalCompletedHours] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const entries = await getTimeEntries(user.id);
          setTimeEntries(entries);
          
          // Calculate total hours and progress
          const totalHours = calculateTotalHours(entries);
          setTotalCompletedHours(totalHours);
          setOverallProgress(calculateOverallProgress(totalHours, user));
          
          // Check if there's an entry for today
          const today = new Date().toISOString().split('T')[0];
          const todayEntryData = entries.find(entry => entry.date === today);
          
          if (todayEntryData) {
            setTodayEntry(todayEntryData);
          } else {
            setTodayEntry(null);
          }
        } catch (error) {
          console.error('Error fetching time entries:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTimeEntries();
  }, [user]);

  const handleTimeIn = async () => {
    if (!user?.id) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId: user.id,
      date: today,
      timeIn: currentTime,
      timeOut: null,
      totalHours: null,
      targetHours: targetHours,
      percentage: null,
      status: 'in-progress'
    };
    
    try {
      await addTimeEntry(newEntry);
      setTodayEntry(newEntry);
      setTimeEntries(prev => [newEntry, ...prev]);
    } catch (error) {
      console.error('Error recording time in:', error);
    }
  };

  const handleTimeOut = async () => {
    if (!todayEntry) return;
    
    const now = new Date();
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Calculate hours worked
    const timeInParts = todayEntry.timeIn.split(':');
    const timeOutParts = currentTime.split(':');
    
    const timeInDate = new Date();
    timeInDate.setHours(parseInt(timeInParts[0]), parseInt(timeInParts[1]), 0);
    
    const timeOutDate = new Date();
    timeOutDate.setHours(parseInt(timeOutParts[0]), parseInt(timeOutParts[1]), 0);
    
    const diffMs = timeOutDate.getTime() - timeInDate.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    const percentage = (diffHrs / todayEntry.targetHours) * 100;
    
    const updatedEntry: TimeEntry = {
      ...todayEntry,
      timeOut: currentTime,
      totalHours: parseFloat(diffHrs.toFixed(2)),
      percentage: Math.min(100, parseFloat(percentage.toFixed(1))),
      status: 'completed'
    };
    
    try {
      await updateTimeEntry(updatedEntry);
      setTodayEntry(updatedEntry);
      setTimeEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      ));
      
      // Update total hours and progress
      const newTotalHours = totalCompletedHours + updatedEntry.totalHours;
      setTotalCompletedHours(newTotalHours);
      setOverallProgress(calculateOverallProgress(newTotalHours, user));
    } catch (error) {
      console.error('Error recording time out:', error);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedDate || !timeIn) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Calculate hours and percentage if time out is provided
    let totalHours = null;
    let percentage = null;
    let status: 'in-progress' | 'completed' = 'in-progress';
    
    if (timeOut) {
      const timeInParts = timeIn.split(':');
      const timeOutParts = timeOut.split(':');
      
      const timeInDate = new Date();
      timeInDate.setHours(parseInt(timeInParts[0]), parseInt(timeInParts[1]), 0);
      
      const timeOutDate = new Date();
      timeOutDate.setHours(parseInt(timeOutParts[0]), parseInt(timeOutParts[1]), 0);
      
      // Handle case where time out is before time in (next day)
      let diffMs = timeOutDate.getTime() - timeInDate.getTime();
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000; // Add a day
      }
      
      const diffHrs = diffMs / (1000 * 60 * 60);
      totalHours = parseFloat(diffHrs.toFixed(2));
      percentage = Math.min(100, parseFloat(((totalHours / targetHours) * 100).toFixed(1)));
      status = 'completed';
    }
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId: user.id,
      date: selectedDate,
      timeIn: timeIn,
      timeOut: timeOut || null,
      totalHours,
      targetHours,
      percentage,
      status
    };
    
    try {
      await addTimeEntry(newEntry);
      
      setTimeEntries(prev => [newEntry, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      
      // If the entry is completed, update total hours and progress
      if (status === 'completed' && totalHours !== null) {
        const newTotalHours = totalCompletedHours + totalHours;
        setTotalCompletedHours(newTotalHours);
        setOverallProgress(calculateOverallProgress(newTotalHours, user));
      }
      
      // If the entry is for today, update todayEntry
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate === today) {
        setTodayEntry(newEntry);
      }
      
      // Reset form
      setSelectedDate('');
      setTimeIn('');
      setTimeOut('');
      setIsAddingNew(false);
      setError('');
    } catch (error) {
      console.error('Error adding time entry:', error);
      setError('Failed to add time entry');
    }
  };

  if (!user?.requiredHours) {
    return (
      <Layout title="Time Tracker">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Required Hours Not Set</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please update your profile with your required OJT hours to properly track your progress.</p>
                <a href="/profile" className="font-medium underline hover:text-yellow-900">Update Profile</a>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Time Tracker">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Overall Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">OJT Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Completed Hours</p>
                <p className="text-2xl font-bold text-blue-700">{totalCompletedHours.toFixed(1)}</p>
                <p className="text-sm text-blue-500">of {user.requiredHours} required hours</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Days Attended</p>
                <p className="text-2xl font-bold text-green-700">
                  {timeEntries.filter(entry => entry.status === 'completed').length}
                </p>
                <p className="text-sm text-green-500">total days</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Overall Progress</p>
                <div className="flex items-center mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                    <div 
                      className={`h-4 rounded-full ${
                        overallProgress >= 90 ? 'bg-green-500' :
                        overallProgress >= 70 ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-semibold text-purple-700">
                    {overallProgress.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-purple-500 mt-1">
                  {user.requiredHours - totalCompletedHours > 0
                    ? `${(user.requiredHours - totalCompletedHours).toFixed(1)} hours remaining`
                    : 'Requirement completed!'}
                </p>
              </div>
            </div>
          </div>

          {/* Today's Attendance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
                <p className="text-sm text-gray-500">
                  {todayEntry 
                    ? todayEntry.status === 'in-progress' 
                      ? `Started at ${todayEntry.timeIn}`
                      : `Completed (${todayEntry.timeIn} - ${todayEntry.timeOut})`
                    : 'No time entry recorded yet'}
                </p>
              </div>
            </div>
            
            {todayEntry ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Time In</div>
                  <div className="text-xl font-semibold text-gray-900">{todayEntry.timeIn}</div>
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Time Out</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {todayEntry.timeOut || 'Not recorded yet'}
                  </div>
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Completion</div>
                  {todayEntry.percentage !== null ? (
                    <div className="flex items-center">
                      <div className="text-xl font-semibold text-gray-900 mr-2">
                        {todayEntry.percentage.toFixed(1)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            todayEntry.percentage >= 90 ? 'bg-green-600' : 
                            todayEntry.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${todayEntry.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl font-semibold text-yellow-600">In progress</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No time entry for today.</p>
                <button
                  onClick={handleTimeIn}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Clock size={18} className="mr-2" />
                  Record Time In
                </button>
              </div>
            )}
            
            {todayEntry && todayEntry.status === 'in-progress' && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleTimeOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Record Time Out
                </button>
              </div>
            )}
          </div>

          {/* Time Entry History */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Time Entry History</h2>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isAddingNew ? 'Cancel' : 'Add Entry'}
            </button>
          </div>
          
          {isAddingNew && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h3 className="text-md font-medium text-gray-900 mb-4">Add Time Entry</h3>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleAddEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="timeIn" className="block text-sm font-medium text-gray-700 mb-1">
                      Time In*
                    </label>
                    <input
                      type="time"
                      id="timeIn"
                      value={timeIn}
                      onChange={(e) => setTimeIn(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="timeOut" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Out
                    </label>
                    <input
                      type="time"
                      id="timeOut"
                      value={timeOut}
                      onChange={(e) => setTimeOut(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="targetHours" className="block text-sm font-medium text-gray-700 mb-1">
                      Target Hours
                    </label>
                    <input
                      type="number"
                      id="targetHours"
                      min="1"
                      max="24"
                      value={targetHours}
                      onChange={(e) => setTargetHours(Number(e.target.value))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {timeEntries.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timeEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.timeIn}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.timeOut || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.totalHours !== null ? entry.totalHours.toFixed(1) : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {entry.percentage !== null ? (
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    entry.percentage >= 90 ? 'bg-green-600' : 
                                    entry.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${entry.percentage}%` }}
                                ></div>
                              </div>
                              <span>{entry.percentage.toFixed(1)}%</span>
                            </div>
                          ) : (
                            <span className="text-yellow-600">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {entry.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock size={12} className="mr-1" />
                              In Progress
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No time entries yet.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default TimeTracker;