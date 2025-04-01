import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveAnalysisResult } from '../supabase';
import { useNavigate } from 'react-router-dom';
import FileUploader from './FileUploader';
import ChartControls from './ChartControls';
import DataChart from './DataChart';
import StatisticalSummary from './StatisticalSummary';
import DataInsights from './DataInsights';
import ComparisonCharts from './ComparisonCharts';
import { 
  performStatisticalAnalysis, 
  performTimeSeriesAnalysis,
  predictFutureValues as predictFutureValuesUtil,
  generateInsights as generateInsightsUtil
} from '../utils/dataAnalysis';

const DataVisualizer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedXColumn, setSelectedXColumn] = useState(null);
  const [selectedYColumn, setSelectedYColumn] = useState(null);
  const [graphType, setGraphType] = useState('line');
  const [additionalCharts, setAdditionalCharts] = useState([]);
  const [showFuturePrediction, setShowFuturePrediction] = useState(false);
  
  // States for saving analysis
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDescription, setAnalysisDescription] = useState('');
  const [saveType, setSaveType] = useState('chart'); // 'chart', 'insight', or 'statistical'
  const [notification, setNotification] = useState(null);

  // Statistical Analysis
  const statisticalAnalysis = useMemo(() => {
    // Ensure data is valid for analysis
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    return performStatisticalAnalysis(data, selectedXColumn, selectedYColumn);
  }, [data, selectedXColumn, selectedYColumn]);

  // Time Series Analysis
  const timeSeriesAnalysis = useMemo(() => {
    // Ensure data is valid for analysis
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    return performTimeSeriesAnalysis(data, columns, selectedXColumn, selectedYColumn);
  }, [data, columns, selectedXColumn, selectedYColumn]);

  // Generate insights
  const insights = useMemo(() => {
    return generateInsightsUtil(statisticalAnalysis, timeSeriesAnalysis, selectedXColumn, selectedYColumn);
  }, [statisticalAnalysis, timeSeriesAnalysis, selectedXColumn, selectedYColumn]);

  const addComparisonChart = () => {
    if (selectedXColumn && selectedYColumn) {
      setAdditionalCharts([...additionalCharts, {
        x: selectedXColumn,
        y: selectedYColumn,
        type: graphType,
        id: Date.now() // unique identifier
      }]);
    }
  };

  const deleteComparisonChart = (id) => {
    setAdditionalCharts(additionalCharts.filter(chart => chart.id !== id));
  };

  // Predict future values wrapper
  const predictFutureValues = () => {
    return predictFutureValuesUtil(data, selectedXColumn, selectedYColumn, statisticalAnalysis);
  };
  
  // Function to handle saving an analysis
  const saveAnalysis = async () => {
    if (!user) {
      setNotification({
        type: 'error',
        message: 'You must be logged in to save analyses'
      });
      return;
    }
    
    try {
      // Get the document ID from the data if it exists
      const documentId = data?.documentId;
      
      console.log('Saving analysis for document ID:', documentId);
      
      if (!documentId) {
        console.warn('No document ID found in data');
      }
      
      // Format the analysis data based on the type
      let formattedAnalysisData = {
        user_id: user.id,
        work_document_id: documentId,
        analysis_type: saveType,
        type: saveType,
        title: analysisTitle || `Analysis of ${selectedYColumn} vs ${selectedXColumn}`,
        description: analysisDescription,
        source: 'work_auto',
        source_label: 'Analysis from Work Auto',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Format the analysis data based on the type
      if (saveType === 'chart') {
        formattedAnalysisData.analysis_data = {
          charts: [{
            type: graphType,
            title: `Analysis of ${selectedYColumn} vs ${selectedXColumn}`,
            data: data.map(item => ({
              name: item[selectedXColumn],
              value: parseFloat(item[selectedYColumn]) || 0
            }))
          }],
          insights: [],
          statistics: {},
          raw_data: data
        };
      } else if (saveType === 'statistical') {
        formattedAnalysisData.analysis_data = {
          charts: [
            {
              type: 'line',
              title: 'Statistical Analysis',
              data: data.map(item => ({
                name: item[selectedXColumn],
                value: parseFloat(item[selectedYColumn]) || 0
              }))
            }
          ],
          insights: insights?.map(insight => ({
            title: insight.type,
            description: insight.text
          })) || [],
          statistics: statisticalAnalysis ? {
            'Mean': statisticalAnalysis.mean.y.toFixed(2),
            'Median': statisticalAnalysis.median.y.toFixed(2),
            'Standard Deviation': statisticalAnalysis.standardDeviation.y.toFixed(2),
            'Correlation': statisticalAnalysis.correlation.toFixed(2),
            'R-squared': statisticalAnalysis.rSquared?.toFixed(2) || 'N/A'
          } : {},
          raw_data: data
        };
      } else if (saveType === 'insight') {
        formattedAnalysisData.analysis_data = {
          charts: [],
          insights: insights?.map(insight => ({
            title: insight.type,
            description: insight.text
          })) || [],
          statistics: {},
          raw_data: data
        };
      }
      
      console.log('Saving analysis with formatted data:', formattedAnalysisData);
      
      // Save to Supabase
      const { data: savedData, error } = await saveAnalysisResult(formattedAnalysisData);
      
      if (error) throw error;
      
      // Show success message
      setNotification({
        type: 'success',
        message: 'Analysis saved successfully!'
      });
      
      console.log('Analysis saved successfully, returned data:', savedData);
      
      // Reset form
      setAnalysisTitle('');
      setAnalysisDescription('');
      setShowSaveModal(false);
      
      // Redirect to dashboard after successful save
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 1500);
    } catch (error) {
      console.error('Error saving analysis:', error);
      // More detailed error message
      let errorMessage = error.message || 'Unknown error';
      if (error.details) {
        errorMessage += ` - ${error.details}`;
      }
      if (error.hint) {
        errorMessage += ` - Hint: ${error.hint}`;
      }
      
      setNotification({
        type: 'error',
        message: `Failed to save analysis: ${errorMessage}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Intelligent Data Explorer
        </h1>

        <FileUploader 
          setData={setData} 
          setColumns={setColumns} 
        />

        {data && (
          <div className="space-y-6">
            <ChartControls 
              columns={columns}
              selectedXColumn={selectedXColumn}
              setSelectedXColumn={setSelectedXColumn}
              selectedYColumn={selectedYColumn}
              setSelectedYColumn={setSelectedYColumn}
              graphType={graphType}
              setGraphType={setGraphType}
              addComparisonChart={addComparisonChart}
              showFuturePrediction={showFuturePrediction}
              setShowFuturePrediction={setShowFuturePrediction}
            />

            {/* Notification */}
            {notification && (
              <div className={`p-4 rounded-md ${
                notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {notification.message}
              </div>
            )}

            {/* Main Visualization */}
            <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-inner">
              <DataChart 
                data={data}
                selectedXColumn={selectedXColumn}
                selectedYColumn={selectedYColumn}
                graphType={graphType}
                statisticalAnalysis={statisticalAnalysis}
                timeSeriesAnalysis={timeSeriesAnalysis}
                showFuturePrediction={showFuturePrediction}
                predictFutureValues={predictFutureValues}
              />
              
              {/* Save Analysis Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setSaveType('chart');
                    setShowSaveModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Chart Analysis
                </button>
              </div>
            </div>

            {/* Statistical Overview */}
            <div>
              <StatisticalSummary 
                statisticalAnalysis={statisticalAnalysis} 
              />
              
              {/* Save Statistical Analysis Button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    setSaveType('statistical');
                    setShowSaveModal(true);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Save Statistical Analysis
                </button>
              </div>
            </div>

            {/* Automated Insights */}
            <div>
              <DataInsights 
                insights={insights} 
              />
              
              {/* Save Insights Button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    setSaveType('insight');
                    setShowSaveModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Insights
                </button>
              </div>
            </div>

            {/* Additional Comparison Charts */}
            <ComparisonCharts 
              additionalCharts={additionalCharts}
              data={data}
              statisticalAnalysis={statisticalAnalysis}
              timeSeriesAnalysis={timeSeriesAnalysis}
              showFuturePrediction={showFuturePrediction}
              predictFutureValues={predictFutureValues}
              deleteComparisonChart={deleteComparisonChart}
            />
          </div>
        )}
      </div>
      
      {/* Save Analysis Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Save {saveType === 'chart' ? 'Chart' : saveType === 'statistical' ? 'Statistical' : 'Insight'} Analysis
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={analysisTitle}
                onChange={(e) => setAnalysisTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder={`Analysis of ${selectedYColumn || 'data'}`}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={analysisDescription}
                onChange={(e) => setAnalysisDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter a description for this analysis"
                rows="3"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={saveAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataVisualizer;