import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Clock, FileText, Calendar, Bell, AlertCircle } from 'lucide-react';
import { TimeEntry, WeeklyReport, Announcement } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getTimeEntries, calculateTotalHours, calculateOverallProgress } from '../services/timeService';
import { getWeeklyReports } from '../services/reportService';
import { getAnnouncements } from '../services/announcementService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCompletedHours, setTotalCompletedHours] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true);
        const [timeData, reportData, announcementData] = await Promise.all([
          getTimeEntries(user.id),
          getWeeklyReports(user.id),
          getAnnouncements()
        ]);
        
        setTimeEntries(timeData.slice(0, 5));
        setReports(reportData.slice(0, 3));
        setAnnouncements(announcementData.slice(0, 3));

        // Calculate total hours and progress
        const totalHours = calculateTotalHours(timeData);
        setTotalCompletedHours(totalHours);
        setOverallProgress(calculateOverallProgress(totalHours, user));

        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Clock size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">{overallProgress.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">{totalCompletedHours.toFixed(1)} / {user?.requiredHours || 'N/A'} hrs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FileText size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Weekly Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Calendar size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Attendance</p>
                  <p className="text-2xl font-semibold text-gray-900">{timeEntries.length} days</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Bell size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Announcements</p>
                  <p className="text-2xl font-semibold text-gray-900">{announcements.length}</p>
                </div>
              </div>
            </div>
          </div>

          {!user?.startDate && !user?.endDate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Profile Update Required</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Please update your profile with your OJT start and end dates to properly track your progress.</p>
                    <Link to="/profile" className="font-medium underline hover:text-yellow-900">Update Profile</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Time Entries */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">Recent Attendance</h2>
                  <Link to="/time-tracker" className="text-sm text-blue-600 hover:text-blue-800">
                    View all
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  {timeEntries.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timeEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.timeIn}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.timeOut || '-'}</td>
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
                                <span className="text-yellow-600">In progress</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No time entries yet. <Link to="/time-tracker" className="text-blue-600 hover:text-blue-800">Record your time</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">Announcements</h2>
                  <Link to="/announcements" className="text-sm text-blue-600 hover:text-blue-800">
                    View all
                  </Link>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <div key={announcement.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start">
                          {announcement.important && (
                            <AlertCircle size={18} className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                            <p className="mt-2 text-xs text-gray-500">{formatDate(announcement.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No announcements yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link 
                    to="/time-tracker" 
                    className="block w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Record Time Entry
                  </Link>
                  <Link 
                    to="/weekly-report" 
                    className="block w-full py-2 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Submit Weekly Report
                  </Link>
                  <Link 
                    to="/survey" 
                    className="block w-full py-2 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Complete Daily Survey
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Dashboard;