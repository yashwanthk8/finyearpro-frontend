import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  const [data, setData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedXColumn, setSelectedXColumn] = useState(null);
  const [selectedYColumn, setSelectedYColumn] = useState(null);
  const [graphType, setGraphType] = useState('line');
  const [additionalCharts, setAdditionalCharts] = useState([]);
  const [showFuturePrediction, setShowFuturePrediction] = useState(false);
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
            </div>

            {/* Statistical Overview */}
            <div>
              <StatisticalSummary 
                statisticalAnalysis={statisticalAnalysis} 
              />
            </div>

            {/* Automated Insights */}
            <div>
              <DataInsights 
                insights={insights} 
              />
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
    </div>
  );
};

export default DataVisualizer;