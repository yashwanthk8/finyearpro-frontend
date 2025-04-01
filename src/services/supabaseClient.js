import { supabase } from '../supabase';

export const saveAnalysisResult = async (analysisData) => {
  // Remove document_id if it's null or undefined to avoid foreign key issues
  const { document_id, ...dataWithoutDocId } = analysisData;
  
  // Only include document_id if it has a valid value
  const dataToInsert = document_id ? analysisData : dataWithoutDocId;
  
  console.log('Saving analysis data:', dataToInsert);
  
  const result = await supabase
    .from('analysis_results')
    .insert(dataToInsert)
    .select();
    
  console.log('Save result:', result);
  
  return result;
}; 