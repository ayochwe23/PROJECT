import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, FileText, Clock, Bell, 
  BarChart2, PieChart, TrendingUp
} from 'lucide-react';
import { User, TimeEntry, WeeklyReport, SurveyResponse } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getAllUsers } from '../services/userService';
import { getAllTimeEntries } from '../services/timeService';
import { getAllWeeklyReports } from '../services/reportService';
import { getAllSurveyResponses } from '../services/surveyService';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.isAdmin) {
        setLoading(true);
        try {
          const [usersData, timeData, reportData, surveyData] = await Promise.all([
            getAllUsers(),
            getAllTimeEntries(),
            getAllWeeklyReports(),
            getAllSurveyResponses()
          ]);
          
          setUsers(usersData);
          setTimeEntries(timeData);
          setReports(reportData);
          setSurveys(surveyData);
        } catch (error) {
          console.error('Error fetching admin data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats
  const calculateStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => !u.isAdmin).length;
    const totalCompletedTimeEntries = timeEntries.filter(entry => entry.status === 'completed').length;
    const totalReports = reports.length;
    const completedSurveys = surveys.length;
    
    // Calculate average completion percentage
    const completedEntries = timeEntries.filter(entry => entry.percentage !== null);
    const averageCompletion = completedEntries.length 
      ? completedEntries.reduce((sum, entry) => sum + (entry.percentage || 0), 0) / completedEntries.length
      : 0;
    
    // Reports by date (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    const reportsByDate = last7Days.map(date => {
      return {
        date,
        count: reports.filter(r => r.submittedAt?.startsWith(date)).length
      };
    }).reverse();
    
    // Problems encountered
    const problemStats = {
      onTheJob: surveys.filter(s => s.problemEncountered.onTheJob).length,
      againstSuperior: surveys.filter(s => s.problemEncountered.againstSuperior).length,
      participatingCompany: surveys.filter(s => s.problemEncountered.participatingCompany).length,
      others: surveys.filter(s => s.problemEncountered.others).length,
      none: surveys.filter(s => 
        !s.problemEncountered.onTheJob && 
        !s.problemEncountered.againstSuperior && 
        !s.problemEncountered.participatingCompany && 
        !s.problemEncountered.others
      ).length
    };
    
    return {
      totalUsers,
      activeUsers,
      totalCompletedTimeEntries,
      totalReports,
      completedSurveys,
      averageCompletion,
      reportsByDate,
      problemStats
    };
  };

  const stats = calculateStats();

  return (
    <Layout title="Admin Dashboard">
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
                  <Users size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Trainees</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FileText size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalReports}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Clock size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg. Completion</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.averageCompletion.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Bell size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Surveys</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completedSurveys}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <Users size={20} className="text-gray-400 mr-2" />
                  <h2 className="font-semibold text-gray-800">Recent Trainees</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {users.filter(u => !u.isAdmin).length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users
                        .filter(u => !u.isAdmin)
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((trainee) => (
                          <tr key={trainee.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                  {trainee.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{trainee.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trainee.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(trainee.createdAt)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No trainees have signed up yet.
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <FileText size={20} className="text-gray-400 mr-2" />
                  <h2 className="font-semibold text-gray-800">Recent Reports</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {reports.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainee</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports
                        .sort((a, b) => {
                          const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
                          const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
                          return dateB - dateA;
                        })
                        .slice(0, 5)
                        .map((report) => {
                          const trainee = users.find(u => u.id === report.userId);
                          return (
                            <tr key={report.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {trainee?.name || 'Unknown user'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(report.weekStartDate)} - {formatDate(report.weekEndDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {report.submittedAt ? formatDate(report.submittedAt) : 'Draft'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No reports have been submitted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reports Trend */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <TrendingUp size={20} className="text-gray-400 mr-2" />
                <h2 className="font-semibold text-gray-800">Reports Submitted (Last 7 Days)</h2>
              </div>
              
              <div className="h-64 flex items-end space-x-2">
                {stats.reportsByDate.map((item, index) => {
                  const maxCount = Math.max(...stats.reportsByDate.map(d => d.count));
                  const height = maxCount === 0 ? 0 : (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full relative flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-100 hover:bg-blue-200 transition-all rounded-t"
                          style={{ height: `${height === 0 ? 4 : height}%` }}
                        >
                          {item.count > 0 && (
                            <div className="absolute -top-7 w-full text-center text-xs font-medium text-gray-600">
                              {item.count}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{formatDate(item.date).slice(0, 5)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Problem Types */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <PieChart size={20} className="text-gray-400 mr-2" />
                <h2 className="font-semibold text-gray-800">Problems Reported</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">On the job</span>
                    <span className="text-sm font-medium text-gray-900">{stats.problemStats.onTheJob}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${stats.completedSurveys ? (stats.problemStats.onTheJob / stats.completedSurveys) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Against superior</span>
                    <span className="text-sm font-medium text-gray-900">{stats.problemStats.againstSuperior}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${stats.completedSurveys ? (stats.problemStats.againstSuperior / stats.completedSurveys) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Company related</span>
                    <span className="text-sm font-medium text-gray-900">{stats.problemStats.participatingCompany}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${stats.completedSurveys ? (stats.problemStats.participatingCompany / stats.completedSurveys) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Others</span>
                    <span className="text-sm font-medium text-gray-900">{stats.problemStats.others}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${stats.completedSurveys ? (stats.problemStats.others / stats.completedSurveys) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">No problems</span>
                    <span className="text-sm font-medium text-gray-900">{stats.problemStats.none}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.completedSurveys ? (stats.problemStats.none / stats.completedSurveys) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default AdminDashboard;