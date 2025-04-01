import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase';

const DebugTool = ({ refreshData }) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fixedAnalyses, setFixedAnalyses] = useState(null);
  const [fixingInProgress, setFixingInProgress] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);

  const fetchRawAnalyses = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Direct query to the database without any formatting
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Database query error:', error);
        setError(error.message);
      } else {
        console.log('Raw database results:', data);
        setAnalyses(data || []);
      }
    } catch (err) {
      console.error('Exception in debug query:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fixAnalysisDataStructure = async () => {
    if (!analyses.length) {
      alert('No analyses to fix');
      return;
    }
    
    setFixingInProgress(true);
    
    const problemAnalyses = [];
    const fixedResults = [];
    
    for (const analysis of analyses) {
      try {
        // Check if analysis_data exists
        if (!analysis.analysis_data) {
          problemAnalyses.push({
            id: analysis.id,
            issue: 'Missing analysis_data',
            fixed: false
          });
          continue;
        }
        
        // Parse analysis_data if it's a string
        let parsedData = analysis.analysis_data;
        if (typeof parsedData === 'string') {
          try {
            parsedData = JSON.parse(parsedData);
          } catch (e) {
            problemAnalyses.push({
              id: analysis.id,
              issue: 'Invalid JSON in analysis_data',
              fixed: false
            });
            continue;
          }
        }
        
        // Check if it's an object
        if (typeof parsedData !== 'object' || parsedData === null) {
          problemAnalyses.push({
            id: analysis.id,
            issue: 'analysis_data is not an object',
            fixed: false
          });
          continue;
        }
        
        // Check if it has the required structure
        const missingKeys = [];
        if (!parsedData.charts) missingKeys.push('charts');
        if (!parsedData.insights) missingKeys.push('insights');
        if (!parsedData.statistics) missingKeys.push('statistics');
        if (!parsedData.raw_data) missingKeys.push('raw_data');
        
        if (missingKeys.length > 0) {
          // Fix the structure
          const fixedData = {
            charts: Array.isArray(parsedData.charts) ? parsedData.charts : [],
            insights: Array.isArray(parsedData.insights) ? parsedData.insights : [],
            statistics: typeof parsedData.statistics === 'object' ? parsedData.statistics : {},
            raw_data: typeof parsedData.raw_data === 'object' ? parsedData.raw_data : parsedData // Save original data if possible
          };
          
          // Update in database
          const { data, error } = await supabase
            .from('analysis_results')
            .update({ analysis_data: fixedData })
            .eq('id', analysis.id)
            .select();
            
          if (error) {
            problemAnalyses.push({
              id: analysis.id,
              issue: `Failed to fix: ${error.message}`,
              fixed: false
            });
          } else {
            fixedResults.push({
              id: analysis.id,
              issue: `Fixed missing keys: ${missingKeys.join(', ')}`,
              fixed: true
            });
          }
        }
      } catch (err) {
        problemAnalyses.push({
          id: analysis.id,
          issue: `Error processing: ${err.message}`,
          fixed: false
        });
      }
    }
    
    setFixedAnalyses({
      problemAnalyses,
      fixedResults
    });
    
    setFixingInProgress(false);
    
    // Refresh analyses
    fetchRawAnalyses();
  };
  
  const createDemoAnalysis = async () => {
    if (!user) return;
    
    setCreatingDemo(true);
    setError(null);
    
    try {
      // Create a sample analysis with proper structure
      const sampleAnalysis = {
        user_id: user.id,
        title: "Demo Analysis",
        description: "This is a sample analysis created for testing",
        source: "work_auto",
        source_label: "Demo Analysis",
        type: "chart",
        analysis_type: "chart",
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        analysis_data: {
          charts: [
            {
              type: "line",
              title: "Sample Chart",
              data: [
                { name: "Jan", value: 100 },
                { name: "Feb", value: 150 },
                { name: "Mar", value: 200 },
                { name: "Apr", value: 120 },
                { name: "May", value: 180 }
              ]
            }
          ],
          insights: [
            {
              title: "Sample Insight",
              description: "This is a sample insight for demonstration purposes."
            }
          ],
          statistics: {
            "Average": "150",
            "Max": "200",
            "Min": "100"
          },
          raw_data: {
            source: "demo",
            data_points: 5
          }
        }
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('analysis_results')
        .insert([sampleAnalysis])
        .select();
      
      if (error) {
        console.error('Error creating sample analysis:', error);
        setError(`Failed to create sample analysis: ${error.message}`);
      } else {
        console.log('Sample analysis created:', data);
        
        // Refresh the analyses in the parent component
        if (refreshData && typeof refreshData === 'function') {
          refreshData();
          // If we're on the dashboard page (detected by absence of /debug in pathname)
          if (window.location.pathname.indexOf('/debug') === -1) {
            // Try to switch to analyses tab programmatically 
            const analysesTabButton = document.querySelector('button[data-tab="analyses"]');
            if (analysesTabButton) {
              analysesTabButton.click();
            }
            alert('Sample analysis created successfully! Switching to Analyses tab...');
          } else {
            alert('Sample analysis created successfully! Click the "Your Saved Analyses" tab to view it.');
          }
        } else {
          alert('Sample analysis created successfully!');
        }
        
        // Refresh the list
        fetchRawAnalyses();
      }
    } catch (err) {
      console.error('Exception creating sample analysis:', err);
      setError(`Exception: ${err.message}`);
    } finally {
      setCreatingDemo(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 debug-tool-container">
      <h2 className="text-xl font-semibold mb-4">Debug Tool</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          onClick={fetchRawAnalyses}
          className="px-4 py-2 bg-gray-600 text-white rounded"
          disabled={loading || fixingInProgress || creatingDemo}
        >
          {loading ? 'Loading...' : 'Query Raw Analysis Results'}
        </button>
        
        <button 
          onClick={fixAnalysisDataStructure}
          className="px-4 py-2 bg-orange-600 text-white rounded"
          disabled={loading || fixingInProgress || analyses.length === 0 || creatingDemo}
        >
          {fixingInProgress ? 'Fixing...' : 'Fix Analysis Data Structure'}
        </button>
        
        <button
          onClick={createDemoAnalysis}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading || fixingInProgress || creatingDemo}
        >
          {creatingDemo ? 'Creating...' : 'Create Demo Analysis'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          Error: {error}
        </div>
      )}
      
      {/* Show fix results */}
      {fixedAnalyses && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Fix Results:</h3>
          {fixedAnalyses.fixedResults.length === 0 && fixedAnalyses.problemAnalyses.length === 0 ? (
            <p className="text-green-600">No issues found! All analyses have the correct structure.</p>
          ) : (
            <>
              {fixedAnalyses.fixedResults.length > 0 && (
                <div className="mb-2">
                  <p className="font-medium text-green-600">{fixedAnalyses.fixedResults.length} analyses fixed:</p>
                  <ul className="list-disc pl-5">
                    {fixedAnalyses.fixedResults.map((result, i) => (
                      <li key={i} className="text-green-600">{result.id}: {result.issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {fixedAnalyses.problemAnalyses.length > 0 && (
                <div>
                  <p className="font-medium text-red-600">{fixedAnalyses.problemAnalyses.length} analyses with issues:</p>
                  <ul className="list-disc pl-5">
                    {fixedAnalyses.problemAnalyses.map((problem, i) => (
                      <li key={i} className="text-red-600">{problem.id}: {problem.issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      <div className="overflow-auto">
        {analyses.length === 0 ? (
          <p className="text-gray-500">No raw analysis records found</p>
        ) : (
          <div>
            <p className="mb-2">Found {analyses.length} raw analysis records:</p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">ID</th>
                  <th className="border p-2 text-left">Type</th>
                  <th className="border p-2 text-left">Title</th>
                  <th className="border p-2 text-left">Created At</th>
                  <th className="border p-2 text-left">Data Structure</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map(analysis => {
                  // Check analysis_data structure
                  let dataStructure = 'Missing';
                  let structureClass = 'text-red-600';
                  
                  if (analysis.analysis_data) {
                    try {
                      const data = typeof analysis.analysis_data === 'string' 
                        ? JSON.parse(analysis.analysis_data) 
                        : analysis.analysis_data;
                        
                      if (typeof data !== 'object' || data === null) {
                        dataStructure = 'Not an object';
                      } else {
                        const hasCharts = !!data.charts;
                        const hasInsights = !!data.insights;
                        const hasStatistics = !!data.statistics;
                        const hasRawData = !!data.raw_data;
                        
                        if (hasCharts && hasInsights && hasStatistics && hasRawData) {
                          dataStructure = 'Complete';
                          structureClass = 'text-green-600 font-medium';
                        } else {
                          const missing = [];
                          if (!hasCharts) missing.push('charts');
                          if (!hasInsights) missing.push('insights');
                          if (!hasStatistics) missing.push('statistics');
                          if (!hasRawData) missing.push('raw_data');
                          
                          dataStructure = `Missing: ${missing.join(', ')}`;
                          structureClass = 'text-orange-600';
                        }
                      }
                    } catch (e) {
                      dataStructure = 'Invalid JSON';
                    }
                  }
                  
                  return (
                    <tr key={analysis.id} className="border-b">
                      <td className="border p-2">{analysis.id}</td>
                      <td className="border p-2">{analysis.type || analysis.analysis_type || 'N/A'}</td>
                      <td className="border p-2">{analysis.title || 'Untitled'}</td>
                      <td className="border p-2">{new Date(analysis.created_at).toLocaleString()}</td>
                      <td className={`border p-2 ${structureClass}`}>{dataStructure}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugTool; 