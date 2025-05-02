import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Save } from 'lucide-react';
import { SurveyResponse } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getSurveyResponses, addSurveyResponse } from '../services/surveyService';

const Survey: React.FC = () => {
  const { user } = useAuth();
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [sameDepartment, setSameDepartment] = useState(true);
  const [newDepartment, setNewDepartment] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [underwentOrientation, setUnderwentOrientation] = useState(true);
  const [skillAcquisitionMethod, setSkillAcquisitionMethod] = useState('');
  const [problemOnTheJob, setProblemOnTheJob] = useState(false);
  const [problemAgainstSuperior, setProblemAgainstSuperior] = useState(false);
  const [problemParticipatingCompany, setProblemParticipatingCompany] = useState(false);
  const [problemOthers, setProblemOthers] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  
  // Check if already submitted today
  const [todaySubmitted, setTodaySubmitted] = useState(false);
  
  useEffect(() => {
    const fetchSurveyResponses = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const responses = await getSurveyResponses(user.id);
          setSurveyResponses(responses);
          
          // Check if there's a response for today
          const today = new Date().toISOString().split('T')[0];
          const todayResponse = responses.find(response => response.date === today);
          
          if (todayResponse) {
            setTodaySubmitted(true);
          }
        } catch (error) {
          console.error('Error fetching survey responses:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSurveyResponses();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!user?.id) {
      setError('You must be logged in to submit a survey');
      return;
    }
    
    // Validation
    if (!sameDepartment && (!newDepartment.trim() || !newJobDescription.trim())) {
      setError('Please provide new department and job description');
      return;
    }
    
    if (!underwentOrientation && !skillAcquisitionMethod.trim()) {
      setError('Please explain how you acquired new skills/knowledge');
      return;
    }
    
    if ((problemOnTheJob || problemAgainstSuperior || problemParticipatingCompany || problemOthers) && !problemDescription.trim()) {
      setError('Please describe the problem you encountered');
      return;
    }
    
    try {
      const newResponse: SurveyResponse = {
        id: Date.now().toString(),
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        sameDepartment,
        newDepartment: !sameDepartment ? newDepartment.trim() : undefined,
        newJobDescription: !sameDepartment ? newJobDescription.trim() : undefined,
        underwentOrientation,
        skillAcquisitionMethod: !underwentOrientation ? skillAcquisitionMethod.trim() : undefined,
        problemEncountered: {
          onTheJob: problemOnTheJob,
          againstSuperior: problemAgainstSuperior,
          participatingCompany: problemParticipatingCompany,
          others: problemOthers,
          description: (problemOnTheJob || problemAgainstSuperior || problemParticipatingCompany || problemOthers) 
            ? problemDescription.trim() 
            : undefined
        }
      };
      
      await addSurveyResponse(newResponse);
      
      setSurveyResponses([newResponse, ...surveyResponses]);
      setTodaySubmitted(true);
      setSuccess('Survey submitted successfully!');
      
      // Reset form
      setSameDepartment(true);
      setNewDepartment('');
      setNewJobDescription('');
      setUnderwentOrientation(true);
      setSkillAcquisitionMethod('');
      setProblemOnTheJob(false);
      setProblemAgainstSuperior(false);
      setProblemParticipatingCompany(false);
      setProblemOthers(false);
      setProblemDescription('');
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError('Failed to submit survey. Please try again.');
    }
  };

  return (
    <Layout title="Daily Survey">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {todaySubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Survey Completed</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>You have already submitted your daily survey for today. Thank you!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Daily Survey</h2>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 rounded-md p-3 text-sm">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Question 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      1. Are you still assigned in the same department?
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="same-department-yes"
                          name="same-department"
                          type="radio"
                          checked={sameDepartment}
                          onChange={() => setSameDepartment(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="same-department-yes" className="ml-3 block text-sm text-gray-700">
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="same-department-no"
                          name="same-department"
                          type="radio"
                          checked={!sameDepartment}
                          onChange={() => setSameDepartment(false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="same-department-no" className="ml-3 block text-sm text-gray-700">
                          No
                        </label>
                      </div>
                    </div>
                    
                    {!sameDepartment && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <label htmlFor="new-department" className="block text-sm font-medium text-gray-700 mb-1">
                          Indicate your new department:
                        </label>
                        <input
                          type="text"
                          id="new-department"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md mb-3"
                        />
                        
                        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Briefly describe your new job:
                        </label>
                        <textarea
                          id="job-description"
                          value={newJobDescription}
                          onChange={(e) => setNewJobDescription(e.target.value)}
                          rows={2}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                    )}
                  </div>
                  
                  {/* Question 2 */}
                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2. Did you undergo orientation in acquiring new skills / knowledge?
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="orientation-yes"
                          name="orientation"
                          type="radio"
                          checked={underwentOrientation}
                          onChange={() => setUnderwentOrientation(true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="orientation-yes" className="ml-3 block text-sm text-gray-700">
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="orientation-no"
                          name="orientation"
                          type="radio"
                          checked={!underwentOrientation}
                          onChange={() => setUnderwentOrientation(false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="orientation-no" className="ml-3 block text-sm text-gray-700">
                          No
                        </label>
                      </div>
                    </div>
                    
                    {!underwentOrientation && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <label htmlFor="skill-acquisition" className="block text-sm font-medium text-gray-700 mb-1">
                          State how you acquired / learned the new skill/s / knowledge:
                        </label>
                        <textarea
                          id="skill-acquisition"
                          value={skillAcquisitionMethod}
                          onChange={(e) => setSkillAcquisitionMethod(e.target.value)}
                          rows={2}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                    )}
                  </div>
                  
                  {/* Question 3 */}
                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      3. Did you encounter problems? (Select all that apply)
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="problem-job"
                          name="problem-job"
                          type="checkbox"
                          checked={problemOnTheJob}
                          onChange={(e) => setProblemOnTheJob(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="problem-job" className="ml-3 block text-sm text-gray-700">
                          On the job
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="problem-superior"
                          name="problem-superior"
                          type="checkbox"
                          checked={problemAgainstSuperior}
                          onChange={(e) => setProblemAgainstSuperior(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="problem-superior" className="ml-3 block text-sm text-gray-700">
                          Against the superior
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="problem-company"
                          name="problem-company"
                          type="checkbox"
                          checked={problemParticipatingCompany}
                          onChange={(e) => setProblemParticipatingCompany(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="problem-company" className="ml-3 block text-sm text-gray-700">
                          Participating company in general
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="problem-others"
                          name="problem-others"
                          type="checkbox"
                          checked={problemOthers}
                          onChange={(e) => setProblemOthers(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="problem-others" className="ml-3 block text-sm text-gray-700">
                          Others
                        </label>
                      </div>
                    </div>
                    
                    {(problemOnTheJob || problemAgainstSuperior || problemParticipatingCompany || problemOthers) && (
                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <label htmlFor="problem-description" className="block text-sm font-medium text-gray-700 mb-1">
                          Please state briefly:
                        </label>
                        <textarea
                          id="problem-description"
                          value={problemDescription}
                          onChange={(e) => setProblemDescription(e.target.value)}
                          rows={3}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Save size={18} className="mr-2" />
                    Submit Survey
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Previous Submissions</h3>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {surveyResponses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Same Department</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Underwent Orientation</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problems Encountered</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {surveyResponses.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(response.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {response.sameDepartment ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <XCircle size={12} className="mr-1" />
                              No - {response.newDepartment}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {response.underwentOrientation ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <XCircle size={12} className="mr-1" />
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {(response.problemEncountered.onTheJob || 
                           response.problemEncountered.againstSuperior || 
                           response.problemEncountered.participatingCompany || 
                           response.problemEncountered.others) ? (
                            <div>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-1">
                                Yes
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {response.problemEncountered.onTheJob && <span className="mr-1">On job</span>}
                                {response.problemEncountered.againstSuperior && <span className="mr-1">Superior</span>}
                                {response.problemEncountered.participatingCompany && <span className="mr-1">Company</span>}
                                {response.problemEncountered.others && <span>Others</span>}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle size={12} className="mr-1" />
                              None
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                You haven't submitted any surveys yet.
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default Survey;