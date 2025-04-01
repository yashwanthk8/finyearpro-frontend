import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and anon key
// You'll get these when you create a project on Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Document related functions
export const uploadDocumentMetadata = async (documentData) => {
  try {
    // Log detailed input for debugging
    console.log('Raw document data received:', JSON.stringify(documentData));
    
    if (!documentData.user_id) {
      console.error('Missing required user_id in document data');
      return { data: null, error: { message: 'Missing required user_id' } };
    }
    
    // Fix the field names to match what's in the documents table
    // Ensure key fields are included and formatted correctly
    const dataWithSource = {
      user_id: documentData.user_id,
      // Use both file_name and filename to ensure compatibility
      file_name: documentData.file_name || documentData.filename || 'Unnamed document',
      filename: documentData.file_name || documentData.filename || 'Unnamed document',
      file_type: documentData.file_type || 'application/octet-stream',
      file_size: documentData.file_size || 0,
      file_extension: documentData.file_extension || '',
      file_url: documentData.file_url || '',
      description: documentData.description || 'Uploaded via Auto form',
      source: documentData.source || 'auto_form',
      source_label: documentData.source_label || 'Uploaded from Auto Form',
      has_analysis: false,
      created_at: documentData.created_at || new Date().toISOString()
    };
    
    console.log('Uploading auto form document with fixed fields:', JSON.stringify(dataWithSource));
    
    // Insert into documents table directly without the permission check that's failing
    const { data, error } = await supabase
      .from('documents')
      .insert([dataWithSource])
      .select();
      
    if (error) {
      console.error('Error uploading document from Auto Form:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Data that caused error:', JSON.stringify(dataWithSource));
      
      // Try to get more details about the error
      if (error.code === '42501') {
        console.error('This appears to be a permissions error. Check RLS policies.');
      } else if (error.code === '23502') {
        console.error('This appears to be a not-null constraint violation. Check required fields.');
      } else if (error.code === '23505') {
        console.error('This appears to be a unique constraint violation. Check for duplicates.');
      }
    } else {
      console.log('Auto Form document uploaded successfully:', data);
    }
    
    return { data, error };
  } catch (e) {
    console.error('Exception in uploadDocumentMetadata:', e);
    return { data: null, error: e };
  }
};

export const uploadWorkAutoDocument = async (documentData) => {
  try {
    // Use a different table for work_auto uploads
    const workDocData = {
      user_id: documentData.user_id,
      name: documentData.filename || 'Unnamed document',
      file_type: documentData.file_type || 'application/octet-stream',
      file_extension: documentData.file_extension || '',
      file_size: documentData.file_size || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: 'work_auto',
      source_label: 'Uploaded from Work Auto'
    };
    
    console.log('Uploading to work_documents table:', workDocData);
    
    const { data, error } = await supabase
      .from('work_documents')
      .insert([workDocData])
      .select();
      
    if (error) {
      console.error('Failed to upload to work_documents:', error);
      return { data: null, error };
    }
    
    console.log('Upload success:', data);
    return { data, error: null };
  } catch (e) {
    console.error('Exception in uploadWorkAutoDocument:', e);
    return { data: null, error: e };
  }
};

export const getUserDocuments = async (userId, source = null) => {
  try {
    console.log('Fetching documents for user:', userId, 'with source filter:', source);
    
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);
      
    // Filter by source if specified
    if (source) {
      query = query.eq('source', source);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error in getUserDocuments:', error);
    } else {
      console.log('Documents fetched successfully, count:', data?.length || 0);
    }
    
    return { data, error };
  } catch (e) {
    console.error('Exception in getUserDocuments:', e);
    return { data: null, error: e };
  }
};

export const getWorkAutoDocuments = async (userId) => {
  try {
    console.log('Fetching work documents for user:', userId);
    
    // Get documents from the work_documents table
    const { data, error } = await supabase
      .from('work_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error in getWorkAutoDocuments:', error);
    } else {
      console.log('Work documents fetched successfully, count:', data?.length || 0);
    }
    
    return { data, error };
  } catch (e) {
    console.error('Exception in getWorkAutoDocuments:', e);
    return { data: null, error: e };
  }
};

export const saveAnalysisResult = async (analysisData) => {
  try {
    console.log('Received analysis data:', analysisData);

    // Ensure we have a valid user_id
    if (!analysisData.user_id) {
      console.error('No user_id provided to saveAnalysisResult');
      return { data: null, error: new Error('No user_id provided') };
    }

    // Check if analysis_data is already properly formatted
    let dataToInsert = { ...analysisData };
    
    // If analysis_data is not already in the correct format with charts, insights, statistics, raw_data
    if (analysisData.analysis_data && 
        (!analysisData.analysis_data.charts || !analysisData.analysis_data.insights || 
         !analysisData.analysis_data.statistics || !analysisData.analysis_data.raw_data)) {
      
      console.log('Need to format analysis_data to proper structure');
      
      // Format the analysis data based on the type if not already done
      if (analysisData.analysis_type === 'sales_analysis') {
        const rawData = analysisData.analysis_data || {};
        
        // Format charts
        dataToInsert.analysis_data = {
          charts: [
            {
              type: 'line',
              title: 'Sales Over Time',
              data: rawData.sales_over_time?.map(item => ({
                name: item.date || item.period,
                value: parseFloat(item.amount || item.value) || 0
              })) || []
            },
            {
              type: 'bar',
              title: 'Sales by Category',
              data: rawData.sales_by_category?.map(item => ({
                name: item.category,
                value: parseFloat(item.amount || item.value) || 0
              })) || []
            },
            {
              type: 'pie',
              title: 'Sales Distribution',
              data: rawData.sales_distribution?.map(item => ({
                name: item.category,
                value: parseFloat(item.percentage || item.value) || 0
              })) || []
            }
          ],
          insights: [
            {
              title: 'Top Performing Categories',
              description: rawData.top_categories || 'No data available'
            },
            {
              title: 'Sales Trends',
              description: rawData.sales_trends || 'No data available'
            },
            {
              title: 'Growth Analysis',
              description: rawData.growth_analysis || 'No data available'
            }
          ],
          statistics: {
            'Total Sales': rawData.total_sales?.toLocaleString() || 'N/A',
            'Average Sale': rawData.average_sale?.toLocaleString() || 'N/A',
            'Number of Transactions': rawData.transaction_count?.toString() || 'N/A',
            'Growth Rate': rawData.growth_rate ? `${rawData.growth_rate}%` : 'N/A'
          },
          raw_data: rawData
        };
      }
    } else {
      console.log('Analysis data is already in the correct format');
    }

    // Ensure both type and analysis_type are set (for backward compatibility)
    if (dataToInsert.analysis_type && !dataToInsert.type) {
      dataToInsert.type = dataToInsert.analysis_type;
    }
    
    if (dataToInsert.type && !dataToInsert.analysis_type) {
      dataToInsert.analysis_type = dataToInsert.type;
    }
    
    // If neither is set, default to 'chart'
    if (!dataToInsert.type && !dataToInsert.analysis_type) {
      dataToInsert.type = 'chart';
      dataToInsert.analysis_type = 'chart';
    }

    // Add required metadata fields if they don't exist
    dataToInsert = {
      ...dataToInsert,
      source: dataToInsert.source || 'work_auto',
      source_label: dataToInsert.source_label || 'Analysis from Work Auto',
      status: dataToInsert.status || 'completed',
      created_at: dataToInsert.created_at || new Date().toISOString(),
      updated_at: dataToInsert.updated_at || new Date().toISOString()
    };

    // If there's a document_id but no work_document_id, rename it
    if (dataToInsert.document_id && !dataToInsert.work_document_id) {
      dataToInsert.work_document_id = dataToInsert.document_id;
      delete dataToInsert.document_id;
    }

    console.log('Saving analysis data to Supabase:', dataToInsert);

    const { data, error } = await supabase
      .from('analysis_results')
      .insert([dataToInsert])
      .select();

    if (error) {
      console.error('Error saving analysis:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      throw error;
    }

    console.log('Analysis saved successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Exception in saveAnalysisResult:', error);
    return { data: null, error };
  }
};

export const getDocumentAnalysisResults = async (documentId) => {
  try {
    console.log('Fetching analysis results for document ID:', documentId);
    
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('work_document_id', documentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching document analysis results:', error);
      return { data: null, error };
    }
    
    // Format the analysis data
    const formattedData = data.map(analysis => {
      // Ensure analysis_data has the required structure
      let formattedAnalysisData = analysis.analysis_data;
      
      // Check if analysis_data is a string and try to parse it
      if (typeof formattedAnalysisData === 'string') {
        try {
          formattedAnalysisData = JSON.parse(formattedAnalysisData);
        } catch (e) {
          console.error('Error parsing analysis_data string:', e);
          formattedAnalysisData = {};
        }
      }
      
      // Ensure the analysis data has the required structure
      if (!formattedAnalysisData || typeof formattedAnalysisData !== 'object') {
        formattedAnalysisData = {};
      }
      
      // Add empty arrays/objects for missing properties
      formattedAnalysisData = {
        charts: formattedAnalysisData.charts || [],
        insights: formattedAnalysisData.insights || [],
        statistics: formattedAnalysisData.statistics || {},
        raw_data: formattedAnalysisData.raw_data || {}
      };
      
      return {
        ...analysis,
        analysis_data: formattedAnalysisData
      };
    });
    
    console.log('Formatted document analysis results:', formattedData);
    return { data: formattedData, error: null };
  } catch (err) {
    console.error('Exception in getDocumentAnalysisResults:', err);
    return { data: null, error: err };
  }
};

// Get user's analyses for dashboard
export const getUserAnalyses = async (userId) => {
  try {
    console.log('Fetching analyses for user ID:', userId);
    
    // Check if userId is valid
    if (!userId) {
      console.error('Invalid user ID provided to getUserAnalyses');
      return { data: [], error: 'Invalid user ID' };
    }
    
    // Join with work_documents to get document info
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching analyses:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { data: [], error };
    }
    
    if (!data || data.length === 0) {
      console.log('No analyses found for user:', userId);
      return { data: [], error: null };
    }
    
    console.log('Fetched raw analyses:', data.length, 'items');
    console.log('First raw analysis:', JSON.stringify(data[0], null, 2));
    
    // Format the analysis data
    const formattedData = data.map(analysis => {
      try {
        console.log(`Processing analysis ID: ${analysis.id}`);
        
        // Get document name from the related work_document
        const documentName = 
          analysis.work_documents?.name || 
          analysis.work_documents?.filename || 
          'Unnamed Document';
        
        console.log(`Document name: "${documentName}" for analysis ID: ${analysis.id}`);
        
        // Get file type
        const fileType = 
          analysis.work_documents?.file_type || 
          analysis.work_documents?.file_extension || 
          'N/A';
        
        // Ensure analysis_data has the required structure
        let formattedAnalysisData = analysis.analysis_data;
        
        // Log the raw analysis data for debugging
        console.log(`Raw analysis_data type: ${typeof formattedAnalysisData}`);
        if (typeof formattedAnalysisData === 'object') {
          console.log(`Raw analysis_data keys: ${Object.keys(formattedAnalysisData || {})}`);
        }
        
        // Check if analysis_data is a string and try to parse it
        if (typeof formattedAnalysisData === 'string') {
          try {
            formattedAnalysisData = JSON.parse(formattedAnalysisData);
            console.log('Successfully parsed analysis_data string to object');
          } catch (e) {
            console.error('Error parsing analysis_data string for analysis ID:', analysis.id, e);
            formattedAnalysisData = {};
          }
        }
        
        // Ensure the analysis data has the required structure
        if (!formattedAnalysisData || typeof formattedAnalysisData !== 'object') {
          console.warn(`Invalid analysis_data format for analysis ID: ${analysis.id}, using empty object`);
          formattedAnalysisData = {};
        }
        
        // Add empty arrays/objects for missing properties
        formattedAnalysisData = {
          charts: formattedAnalysisData.charts || [],
          insights: formattedAnalysisData.insights || [],
          statistics: formattedAnalysisData.statistics || {},
          raw_data: formattedAnalysisData.raw_data || {}
        };
        
        // Create the formatted analysis object
        const formattedAnalysis = {
          ...analysis,
          analysis_data: formattedAnalysisData,
          document_name: documentName,
          file_type: fileType,
          analysis_type: analysis.analysis_type || analysis.type || 'N/A',
          title: analysis.title || `Analysis ${analysis.id}`
        };
        
        console.log(`Formatted analysis for ID ${analysis.id}:`, {
          id: formattedAnalysis.id,
          document_name: formattedAnalysis.document_name,
          analysis_type: formattedAnalysis.analysis_type,
          charts_count: formattedAnalysis.analysis_data.charts.length
        });
        
        return formattedAnalysis;
      } catch (itemError) {
        console.error('Error processing analysis item:', itemError);
        return {
          ...analysis,
          analysis_data: { charts: [], insights: [], statistics: {}, raw_data: {} },
          document_name: 'Error processing document',
          file_type: 'N/A',
          analysis_type: analysis.analysis_type || analysis.type || 'N/A',
          title: analysis.title || `Analysis ${analysis.id}`
        };
      }
    });
    
    console.log('Formatted analyses:', formattedData.length, 'items');
    if (formattedData.length > 0) {
      console.log('First formatted analysis:', JSON.stringify({
        id: formattedData[0].id,
        title: formattedData[0].title,
        document_name: formattedData[0].document_name,
        analysis_type: formattedData[0].analysis_type,
        has_analysis_data: !!formattedData[0].analysis_data,
        charts_count: formattedData[0].analysis_data.charts.length,
        insights_count: formattedData[0].analysis_data.insights.length,
        statistics_keys: Object.keys(formattedData[0].analysis_data.statistics)
      }));
    }
    
    return { data: formattedData, error: null };
  } catch (err) {
    console.error('Exception in getUserAnalyses:', err);
    return { data: [], error: err };
  }
};

export const uploadAnalysisResult = async (documentId, analysisType, analysisData) => {
    try {
        // Format the analysis data to match the required structure
        const formattedAnalysisData = {
            charts: [],
            insights: [],
            statistics: {},
            raw_data: analysisData // Keep the original data for reference
        };

        // Extract and format charts based on analysis type
        if (analysisType === 'sales_analysis') {
            // Example for sales analysis
            formattedAnalysisData.charts = [
                {
                    type: 'line',
                    title: 'Monthly Sales Trend',
                    data: analysisData.monthly_sales?.map(item => ({
                        name: item.month,
                        value: item.amount
                    })) || []
                },
                {
                    type: 'bar',
                    title: 'Product Sales Distribution',
                    data: analysisData.product_sales?.map(item => ({
                        name: item.product,
                        value: item.quantity
                    })) || []
                }
            ];

            formattedAnalysisData.insights = [
                {
                    title: 'Top Performing Product',
                    description: analysisData.top_product || 'No data available'
                },
                {
                    title: 'Sales Growth',
                    description: analysisData.sales_growth || 'No data available'
                }
            ];

            formattedAnalysisData.statistics = {
                'Total Sales': analysisData.total_sales || 'N/A',
                'Average Order Value': analysisData.avg_order_value || 'N/A',
                'Number of Orders': analysisData.total_orders || 'N/A'
            };
        } else if (analysisType === 'financial_analysis') {
            // Example for financial analysis
            formattedAnalysisData.charts = [
                {
                    type: 'line',
                    title: 'Revenue vs Expenses',
                    data: analysisData.revenue_expenses?.map(item => ({
                        name: item.period,
                        value: item.revenue - item.expenses
                    })) || []
                },
                {
                    type: 'pie',
                    title: 'Expense Distribution',
                    data: analysisData.expense_distribution?.map(item => ({
                        name: item.category,
                        value: item.amount
                    })) || []
                }
            ];

            formattedAnalysisData.insights = [
                {
                    title: 'Profit Margin',
                    description: analysisData.profit_margin || 'No data available'
                },
                {
                    title: 'Key Financial Metrics',
                    description: analysisData.key_metrics || 'No data available'
                }
            ];

            formattedAnalysisData.statistics = {
                'Total Revenue': analysisData.total_revenue || 'N/A',
                'Total Expenses': analysisData.total_expenses || 'N/A',
                'Net Profit': analysisData.net_profit || 'N/A'
            };
        }

        // Upload the formatted analysis result
        const { data, error } = await supabase
            .from('analysis_results')
            .insert([
                {
                    document_id: documentId,
                    analysis_type: analysisType,
                    analysis_data: formattedAnalysisData,
                    status: 'completed'
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error uploading analysis result:', error);
        return { data: null, error };
    }
}; 