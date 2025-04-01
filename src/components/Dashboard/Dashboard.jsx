import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDocuments, getWorkAutoDocuments, signOut } from '../../supabase';
import DocumentList from './DocumentList';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [documents, setDocuments] = useState([]);
  const [workDocuments, setWorkDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Check for activeTab state from navigation
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab('documents'); // Default to documents since we no longer have analyses tab
      // Clear the state to prevent sticking
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    // Load user's documents when component mounts
    if (user) {
      fetchUserData();
    } else {
      navigate('/login');
    }
    
    // Setup an auto-refresh timer to poll for new documents
    const refreshInterval = setInterval(() => {
      if (user) {
        console.log('Auto-refreshing documents data...');
        fetchUserData(false); // Don't show loading state for auto-refresh
        setLastRefresh(new Date());
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [user, navigate]);

  const fetchUserData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Fetching data for user:', user.id);
      
      // Fetch regular documents from 'documents' table
      const { data: documentsData, error: documentsError } = await getUserDocuments(user.id);
      
      if (documentsError) {
        console.error('Error fetching regular documents:', documentsError);
        // Don't set the error state to allow partial display
      } else {
        console.log('Regular documents fetched successfully:', documentsData?.length || 0, 'items found');
        console.log('Document sources:', documentsData?.map(doc => doc.source).join(', ') || 'none');
        setDocuments(documentsData || []);
      }
      
      // Fetch work documents from 'work_documents' table
      const { data: workDocsData, error: workDocsError } = await getWorkAutoDocuments(user.id);
      
      if (workDocsError) {
        console.error('Error fetching work documents:', workDocsError);
        // Don't set the error state here to allow partial data display
      } else {
        console.log('Work documents fetched:', workDocsData?.length || 0, 'items found');
        setWorkDocuments(workDocsData || []);
      }
      
      // Only mark as not loading when all fetches are done
      if (showLoading) {
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError('Failed to load your documents. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Filter documents based on source
  const autoFormDocuments = documents.filter(doc => {
    // Show documents with source 'auto_form' or empty/null source 
    // (for backward compatibility with older documents)
    const isAutoForm = doc.source === 'auto_form' || !doc.source;
    if (isAutoForm) {
      console.log('Auto form document found:', doc.id, doc.filename || doc.file_name, 'source:', doc.source);
    }
    return isAutoForm;
  });

  console.log('Filtered Auto Form documents:', autoFormDocuments.length, 'of', documents.length, 'total documents');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Financial Document Analyzer</h1>
          <div className="flex items-center">
            {user && (
              <div className="flex items-center">
                <span className="mr-4 text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome message */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Welcome to your Dashboard!</h2>
          <p className="text-gray-600">
            Here you can view your uploaded documents and create new visualizations.
          </p>
          <div className="mt-4 flex space-x-4">
            <Link
              to="/upload"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Upload New Document
            </Link>
            <Link
              to="/workauto"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Data Explorer
            </Link>
          </div>
        </div>
        
        {/* Refresh indicator */}
        <div className="text-right text-sm text-gray-500 mb-2">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
          <button 
            onClick={() => {
              fetchUserData(true);
              setLastRefresh(new Date());
            }}
            className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
          >
            Refresh Now
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Auto Form Documents */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Documents from Auto Form</h2>
              <p className="text-sm text-gray-600 mb-4">
                Files that have been uploaded through the Auto Form page
              </p>
              <DocumentList 
                documents={autoFormDocuments} 
                onRefresh={fetchUserData}
                emptyMessage="No documents uploaded from the Auto Form yet."
              />
            </div>
            
            {/* WorkAuto Documents */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Documents from Data Explorer</h2>
              <p className="text-sm text-gray-600 mb-4">
                Files that have been uploaded and analyzed in the Data Explorer
              </p>
              <DocumentList 
                documents={workDocuments}
                onRefresh={fetchUserData}
                emptyMessage="No documents have been analyzed in the Data Explorer yet."
                isWorkDocument={true}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 