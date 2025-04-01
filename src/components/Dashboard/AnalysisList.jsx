import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const AnalysisList = ({ analyses }) => {
  const navigate = useNavigate();

  console.log('AnalysisList received analyses:', analyses?.length || 0);
  
  if (!analyses || analyses.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">You haven't saved any analyses yet.</p>
        <button
          onClick={() => navigate('/workauto')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Data Explorer
        </button>
      </div>
    );
  }

  // Normalize the analysis type to one of our categories
  const normalizeAnalysisType = (analysis) => {
    const type = analysis.analysis_type || analysis.type || '';
    
    if (type === 'chart' || 
        type.includes('chart') || 
        type.includes('visualization')) {
      return 'chart';
    } else if (type === 'statistical' || 
              type.includes('statistical') || 
              type.includes('stats')) {
      return 'statistical';
    } else if (type === 'insight' || 
              type.includes('insight') || 
              type.includes('recommendation')) {
      return 'insight';
    } else {
      // Default to chart for unknown types
      console.log('Defaulting unknown analysis type to chart:', type);
      return 'chart';
    }
  };

  // Group analyses by normalized type
  const chartAnalyses = analyses.filter(a => normalizeAnalysisType(a) === 'chart');
  const statisticalAnalyses = analyses.filter(a => normalizeAnalysisType(a) === 'statistical');
  const insightAnalyses = analyses.filter(a => normalizeAnalysisType(a) === 'insight');
  
  console.log('Analysis counts by type:', {
    chart: chartAnalyses.length,
    statistical: statisticalAnalyses.length,
    insight: insightAnalyses.length
  });

  const AnalysisCard = ({ analysis }) => {
    const normalizedType = normalizeAnalysisType(analysis);
    const createdDate = analysis.created_at ? new Date(analysis.created_at) : new Date();
    
    return (
      <div 
        className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/analysis/${analysis.id}`)}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{analysis.title || 'Untitled Analysis'}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            normalizedType === 'chart' 
              ? 'bg-blue-100 text-blue-800' 
              : normalizedType === 'statistical' 
              ? 'bg-purple-100 text-purple-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {normalizedType === 'chart' 
              ? 'Chart' 
              : normalizedType === 'statistical' 
              ? 'Statistical'
              : 'Insight'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {format(createdDate, 'MMM d, yyyy')}
        </p>
        {analysis.document_name && (
          <p className="text-sm text-gray-600 mt-1">
            Document: {analysis.document_name}
          </p>
        )}
        {analysis.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{analysis.description}</p>
        )}
        
        {/* Analysis Data Preview */}
        <div className="mt-2">
          {analysis.analysis_data?.charts?.length > 0 && (
            <p className="text-xs text-blue-600">Charts: {analysis.analysis_data.charts.length}</p>
          )}
          {analysis.analysis_data?.insights?.length > 0 && (
            <p className="text-xs text-green-600">Insights: {analysis.analysis_data.insights.length}</p>
          )}
          {Object.keys(analysis.analysis_data?.statistics || {}).length > 0 && (
            <p className="text-xs text-purple-600">Statistics: {Object.keys(analysis.analysis_data.statistics).length}</p>
          )}
        </div>
      </div>
    );
  };

  const AnalysisSection = ({ title, items, color }) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-3 text-${color}-700`}>{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(analysis => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <AnalysisSection title="Charts & Visualizations" items={chartAnalyses} color="blue" />
      <AnalysisSection title="Statistical Analysis" items={statisticalAnalyses} color="purple" />
      <AnalysisSection title="Insights & Recommendations" items={insightAnalyses} color="green" />
    </div>
  );
};

export default AnalysisList; 