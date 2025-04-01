// This is a temporary script to check your Supabase schema
// Run with: node check_schema.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  try {
    // Try to get the schema of the documents table
    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);
      
    if (documentsError) {
      console.error('Error fetching documents table:', documentsError);
    } else {
      console.log('Documents table exists.');
      if (documentsData.length > 0) {
        console.log('Documents table columns:', Object.keys(documentsData[0]));
      } else {
        console.log('Documents table is empty, creating a test row...');
        
        // Try to insert a minimal test row
        const { data: insertData, error: insertError } = await supabase
          .from('documents')
          .insert([{
            user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
            filename: 'test.csv',
            created_at: new Date().toISOString()
          }])
          .select();
          
        if (insertError) {
          console.error('Insert error:', insertError);
          console.log('Trying to fetch table information directly...');
        } else {
          console.log('Test row inserted successfully:', insertData);
        }
      }
    }
    
    // Check analysis_results table
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_results')
      .select('*')
      .limit(1);
      
    if (analysisError) {
      console.error('Error fetching analysis_results table:', analysisError);
    } else {
      console.log('Analysis_results table exists.');
      if (analysisData.length > 0) {
        console.log('Analysis_results table columns:', Object.keys(analysisData[0]));
      } else {
        console.log('Analysis_results table is empty.');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSchema().then(() => {
  console.log('Schema check complete');
}); 