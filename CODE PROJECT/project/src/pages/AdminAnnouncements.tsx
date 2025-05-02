import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Bell, AlertCircle, PinIcon, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Announcement } from '../types';
import { formatDate } from '../utils/dateUtils';
import { getAnnouncements, addAnnouncement, updateAnnouncement } from '../services/announcementService';

const AdminAnnouncements: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [important, setImportant] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const data = await getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('You must be logged in to manage announcements');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      if (selectedAnnouncement) {
        // Update existing announcement
        const updatedAnnouncement: Announcement = {
          ...selectedAnnouncement,
          title: title.trim(),
          content: content.trim(),
          important
        };
        
        await updateAnnouncement(updatedAnnouncement);
        setAnnouncements(announcements.map(a => 
          a.id === updatedAnnouncement.id ? updatedAnnouncement : a
        ));
        setSuccess('Announcement updated successfully!');
      } else {
        // Add new announcement
        const newAnnouncement: Announcement = {
          id: Date.now().toString(),
          title: title.trim(),
          content: content.trim(),
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          important
        };
        
        await addAnnouncement(newAnnouncement);
        setAnnouncements([newAnnouncement, ...announcements]);
        setSuccess('Announcement added successfully!');
      }
      
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error managing announcement:', error);
      setError('Failed to manage announcement. Please try again.');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setImportant(announcement.important);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const storedAnnouncements = localStorage.getItem('ojtAnnouncements');
      const allAnnouncements: Announcement[] = storedAnnouncements ? JSON.parse(storedAnnouncements) : [];
      const updatedAnnouncements = allAnnouncements.filter(a => a.id !== id);
      localStorage.setItem('ojtAnnouncements', JSON.stringify(updatedAnnouncements));
      
      setAnnouncements(announcements.filter(a => a.id !== id));
      setSuccess('Announcement deleted successfully!');
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement. Please try again.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImportant(false);
    setSelectedAnnouncement(null);
    setShowForm(false);
    setError('');
  };

  return (
    <Layout title="Manage Announcements">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
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
          
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showForm ? (
                <>
                  <X size={18} className="mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={18} className="mr-2" />
                  New Announcement
                </>
              )}
            </button>
          </div>
          
          {showForm && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {selectedAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content*
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="important"
                      type="checkbox"
                      checked={important}
                      onChange={(e) => setImportant(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="important" className="ml-2 block text-sm text-gray-700">
                      Mark as important
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {selectedAnnouncement ? 'Update Announcement' : 'Post Announcement'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">All Announcements</h2>
            <div className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-gray-600">
              {announcements.length} total
            </div>
          </div>
          
          {announcements.length > 0 ? (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`bg-white rounded-lg shadow-sm border ${announcement.important ? 'border-orange-200' : 'border-gray-100'} overflow-hidden transform transition-all duration-200 hover:shadow-md`}
                >
                  <div className={`px-6 py-4 ${announcement.important ? 'bg-orange-50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        {announcement.important && (
                          <AlertCircle size={20} className="text-orange-500 mt-1 mr-2 flex-shrink-0" />
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{formatDate(announcement.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-100">
                    <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <Bell size={24} className="text-blue-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click the "New Announcement" button to create your first announcement.
              </p>
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default AdminAnnouncements;