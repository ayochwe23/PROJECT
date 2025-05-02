import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Eye, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import { WeeklyReport } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getWeeklyReports } from '../services/reportService';

const ReportViewer: React.FC<{ report: WeeklyReport, onClose: () => void }> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Weekly Report
                  </h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4 flex flex-wrap">
                  <div className="w-full md:w-1/3 mb-2 md:mb-0">
                    <p className="text-sm text-gray-500">Week Start:</p>
                    <p className="font-medium">{formatDate(report.weekStartDate)}</p>
                  </div>
                  <div className="w-full md:w-1/3 mb-2 md:mb-0">
                    <p className="text-sm text-gray-500">Week End:</p>
                    <p className="font-medium">{formatDate(report.weekEndDate)}</p>
                  </div>
                  <div className="w-full md:w-1/3">
                    <p className="text-sm text-gray-500">Submitted On:</p>
                    <p className="font-medium">{report.submittedAt ? formatDate(report.submittedAt) : 'N/A'}</p>
                  </div>
                </div>
                
                <h4 className="text-md font-medium text-gray-900 mb-2">Weekly Report Items</h4>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 mb-4">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(item.date)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.task}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.problemEncountered}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.actionsTaken}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.observation || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <h4 className="text-md font-medium text-gray-900 mb-2">Narrative Report</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.narrativeReport}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const data = await getWeeklyReports(user.id);
          setReports(data);
        } catch (error) {
          console.error('Error fetching reports:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchReports();
  }, [user]);

  const toggleSort = (field: 'date' | 'status') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.weekStartDate).getTime();
      const dateB = new Date(b.weekStartDate).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by status
      return sortDirection === 'asc'
        ? (a.submitted === b.submitted ? 0 : a.submitted ? -1 : 1)
        : (a.submitted === b.submitted ? 0 : a.submitted ? 1 : -1);
    }
  });

  const filteredReports = searchQuery
    ? sortedReports.filter(report => 
        report.narrativeReport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.items.some(item => 
          item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.problemEncountered.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.actionsTaken.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.observation.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : sortedReports;

  return (
    <Layout title="Weekly Reports">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md pl-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <Link
              to="/weekly-report"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText size={18} className="mr-2" />
              Create New Report
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {filteredReports.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => toggleSort('date')}
                          className="group inline-flex items-center"
                        >
                          Date
                          <span className="ml-1 text-gray-400 group-hover:text-gray-500">
                            {sortBy === 'date' ? (
                              sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} className="opacity-0 group-hover:opacity-100" />
                            )}
                          </span>
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week Period</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Items</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button
                          onClick={() => toggleSort('status')}
                          className="group inline-flex items-center"
                        >
                          Status
                          <span className="ml-1 text-gray-400 group-hover:text-gray-500">
                            {sortBy === 'status' ? (
                              sortDirection === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} className="opacity-0 group-hover:opacity-100" />
                            )}
                          </span>
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar size={18} className="text-gray-400 mr-2" />
                            {formatDate(report.submittedAt || report.weekStartDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(report.weekStartDate)} - {formatDate(report.weekEndDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.items.length} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {report.submitted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Eye size={16} className="mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {searchQuery ? (
                    <>No reports matching your search criteria.</>
                  ) : (
                    <>
                      No reports found. <Link to="/weekly-report" className="text-blue-600 hover:text-blue-800">Create your first report</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {selectedReport && (
            <ReportViewer 
              report={selectedReport} 
              onClose={() => setSelectedReport(null)} 
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default Reports;