import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDocumentAnalysisResults } from '../../supabase';
import { Link } from 'react-router-dom';

const AnalysisResults = ({ documentId }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    if (documentId) {
      fetchAnalysisResults();
    } else {
      setAnalyses([]);
      setSelectedAnalysis(null);
      setLoading(false);
    }
  }, [documentId]);

  const fetchAnalysisResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching analysis results for document:', documentId);
      const { data, error } = await getDocumentAnalysisResults(documentId);
      
      if (error) throw error;
      
      // Analysis data is already formatted by getDocumentAnalysisResults
      console.log(`Fetched ${data?.length || 0} analysis results`);
      setAnalyses(data || []);
      
      // Select the most recent analysis by default if available
      if (data && data.length > 0) {
        setSelectedAnalysis(data[0]);
      } else {
        setSelectedAnalysis(null);
      }
    } catch (err) {
      console.error('Error fetching analysis results:', err);
      setError('Failed to load analysis results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        {error}
      </div>
    );
  }

  if (!documentId) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700">
        Please select a document to view its analyses.
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">No saved analyses found for this document.</p>
        <p className="text-gray-500">
          Create a new analysis by visualizing this document's data.
        </p>
      </div>
    );
  }

  // Ensure the selected analysis has properly formatted analysis_data
  const selectedAnalysisData = selectedAnalysis?.analysis_data || {
    charts: [],
    insights: [],
    statistics: {},
    raw_data: {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List of saved analyses */}
      <div className="lg:col-span-1">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Saved Analyses
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Select an analysis to view details
            </p>
          </div>
          <ul className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {analyses.map((analysis) => (
              <li 
                key={analysis.id}
                className={`px-4 py-4 cursor-pointer hover:bg-gray-50 ${
                  selectedAnalysis?.id === analysis.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedAnalysis(analysis)}
              >
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {analysis.title || 'Untitled Analysis'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(analysis.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    analysis.analysis_type === 'chart' 
                      ? 'bg-blue-100 text-blue-800' 
                      : analysis.analysis_type === 'insight' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {analysis.analysis_type === 'chart' 
                      ? 'Chart' 
                      : analysis.analysis_type === 'insight' 
                      ? 'Insight' 
                      : 'Statistical'}
                  </span>
                </div>
                {analysis.description && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {analysis.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Selected analysis details */}
      <div className="lg:col-span-2">
        {selectedAnalysis ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {selectedAnalysis.title || 'Untitled Analysis'}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedAnalysis.analysis_type === 'chart' 
                    ? 'bg-blue-100 text-blue-800' 
                    : selectedAnalysis.analysis_type === 'insight' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {selectedAnalysis.analysis_type === 'chart' 
                    ? 'Chart' 
                    : selectedAnalysis.analysis_type === 'insight' 
                    ? 'Insight' 
                    : 'Statistical'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Created {format(new Date(selectedAnalysis.created_at), 'MMM d, yyyy h:mm a')}
              </p>
              {selectedAnalysis.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedAnalysis.description}
                </p>
              )}
            </div>

            <div className="p-4">
              {/* Charts */}
              {selectedAnalysisData.charts && selectedAnalysisData.charts.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-lg mb-3">Charts</h4>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p>
                      {selectedAnalysisData.charts.length} chart(s) available. 
                      <Link 
                        to={`/analysis/${selectedAnalysis.id}`}
                        className="text-blue-600 hover:underline ml-2"
                      >
                        View full analysis
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Insights */}
              {selectedAnalysisData.insights && selectedAnalysisData.insights.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-lg mb-3">Insights</h4>
                  <div className="space-y-3">
                    {selectedAnalysisData.insights.slice(0, 2).map((insight, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-900">{insight.title || `Insight ${idx + 1}`}</h5>
                        <p className="mt-1 text-sm text-gray-600">
                          {insight.description || 'No description available'}
                        </p>
                      </div>
                    ))}
                    {selectedAnalysisData.insights.length > 2 && (
                      <Link 
                        to={`/analysis/${selectedAnalysis.id}`}
                        className="text-blue-600 hover:underline text-sm block mt-2"
                      >
                        View all {selectedAnalysisData.insights.length} insights
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics */}
              {selectedAnalysisData.statistics && Object.keys(selectedAnalysisData.statistics).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-lg mb-3">Statistics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedAnalysisData.statistics)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div key={key} className="p-3 border rounded-lg">
                          <h5 className="text-sm font-semibold text-gray-900 capitalize">
                            {key.replace(/_/g, ' ')}
                          </h5>
                          <p className="mt-1 text-sm text-gray-600">
                            {typeof value === 'object' 
                              ? JSON.stringify(value) 
                              : String(value)}
                          </p>
                        </div>
                      ))}
                  </div>
                  {Object.keys(selectedAnalysisData.statistics).length > 4 && (
                    <Link 
                      to={`/analysis/${selectedAnalysis.id}`}
                      className="text-blue-600 hover:underline text-sm block mt-2"
                    >
                      View all statistics
                    </Link>
                  )}
                </div>
              )}

              {(!selectedAnalysisData.charts || selectedAnalysisData.charts.length === 0) &&
               (!selectedAnalysisData.insights || selectedAnalysisData.insights.length === 0) &&
               (!selectedAnalysisData.statistics || Object.keys(selectedAnalysisData.statistics).length === 0) && (
                <div className="py-6 text-center">
                  <p className="text-gray-500">
                    No detailed analysis data available for this analysis.
                  </p>
                  <Link 
                    to={`/analysis/${selectedAnalysis.id}`}
                    className="text-blue-600 hover:underline block mt-2"
                  >
                    View full analysis page
                  </Link>
                </div>
              )}
            </div>

            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Link 
                to={`/analysis/${selectedAnalysis.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Full Analysis
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-500">Select an analysis from the list to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults; 