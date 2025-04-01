import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalysisDetails = () => {
    const { id } = useParams();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('analysis_results')
                    .select(`
                        *,
                        work_documents (
                            id,
                            name,
                            filename,
                            file_type,
                            file_extension
                        )
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                
                // Set the raw analysis data
                setAnalysis(data);
                
                // Process and format the analysis_data
                let processedData = data.analysis_data;
                
                // If analysis_data is a string, parse it
                if (typeof processedData === 'string') {
                    try {
                        processedData = JSON.parse(processedData);
                    } catch (e) {
                        console.error('Error parsing analysis_data string:', e);
                        processedData = {};
                    }
                }
                
                // Ensure the data has the required structure
                if (!processedData || typeof processedData !== 'object') {
                    processedData = {};
                }
                
                // Add empty arrays/objects for missing properties
                processedData = {
                    charts: processedData.charts || [],
                    insights: processedData.insights || [],
                    statistics: processedData.statistics || {},
                    raw_data: processedData.raw_data || {}
                };
                
                console.log('Processed analysis data:', processedData);
                setAnalysisData(processedData);
                
            } catch (err) {
                console.error('Error fetching analysis:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchAnalysis();
        }
    }, [id]);

    if (loading) return (
        <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="p-8">
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                <p>Error: {error}</p>
                <Link to="/dashboard" className="underline mt-2 inline-block">Return to Dashboard</Link>
            </div>
        </div>
    );
    
    if (!analysis) return (
        <div className="p-8">
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700">
                <p>Analysis not found</p>
                <Link to="/dashboard" className="underline mt-2 inline-block">Return to Dashboard</Link>
            </div>
        </div>
    );

    // Get document name and type
    const documentName = 
        analysis.work_documents?.name || 
        analysis.work_documents?.filename || 
        'Unnamed Document';
        
    const fileType = 
        analysis.work_documents?.file_type || 
        analysis.work_documents?.file_extension || 
        'Unknown Type';

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="mb-4">
                <Link to="/dashboard" className="text-blue-600 hover:underline flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Analysis Details</h1>
            
            {/* Document Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Document Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Document Name</p>
                        <p className="font-medium">{documentName}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">File Type</p>
                        <p className="font-medium">{fileType}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Analysis Type</p>
                        <p className="font-medium">{analysis.analysis_type || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-medium">{analysis.status || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Created At</p>
                        <p className="font-medium">
                            {new Date(analysis.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600">Updated At</p>
                        <p className="font-medium">
                            {new Date(analysis.updated_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Analysis Results */}
            {analysisData && (
                <div className="space-y-6">
                    {/* Charts */}
                    {analysisData.charts && analysisData.charts.length > 0 ? (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Visualizations</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analysisData.charts.map((chart, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <h3 className="font-semibold mb-2">{chart.title || `Chart ${index + 1}`}</h3>
                                        {chart.type === 'line' && chart.data && chart.data.length > 0 && (
                                            <LineChart width={500} height={300} data={chart.data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                            </LineChart>
                                        )}
                                        {chart.type === 'bar' && chart.data && chart.data.length > 0 && (
                                            <BarChart width={500} height={300} data={chart.data}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="value" fill="#8884d8" />
                                            </BarChart>
                                        )}
                                        {chart.type === 'pie' && chart.data && chart.data.length > 0 && (
                                            <PieChart width={500} height={300}>
                                                <Pie
                                                    data={chart.data}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    label
                                                >
                                                    {chart.data.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        )}
                                        {(!chart.data || chart.data.length === 0) && (
                                            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                                                <p className="text-gray-500">No chart data available</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Visualizations</h2>
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p className="text-gray-500">No visualizations available for this analysis</p>
                            </div>
                        </div>
                    )}

                    {/* Insights */}
                    {analysisData.insights && analysisData.insights.length > 0 ? (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analysisData.insights.map((insight, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">{insight.title || `Insight ${index + 1}`}</h3>
                                        <p className="text-gray-700">{insight.description || 'No description available'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p className="text-gray-500">No insights available for this analysis</p>
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    {analysisData.statistics && Object.keys(analysisData.statistics).length > 0 ? (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(analysisData.statistics).map(([key, value]) => (
                                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold mb-2">{key}</h3>
                                        <p className="text-gray-700">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p className="text-gray-500">No statistics available for this analysis</p>
                            </div>
                        </div>
                    )}

                    {/* Raw Data */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Raw Analysis Data</h2>
                        {Object.keys(analysisData.raw_data || {}).length > 0 ? (
                            <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-[400px]">
                                {JSON.stringify(analysisData.raw_data, null, 2)}
                            </pre>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg text-center">
                                <p className="text-gray-500">No raw data available for this analysis</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisDetails; 