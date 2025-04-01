import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  try {
    console.log('Attempting to check database schema...');
    
    // Try to insert a minimal test row to documents table
    const minData = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      filename: 'test.csv',
      created_at: new Date().toISOString()
    };
    
    console.log('Testing with minimal data:', minData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('documents')
      .insert([minData])
      .select();
      
    if (insertError) {
      console.error('Insert error with minimal data:', insertError);
      
      // Try even more minimal data
      const ultraMinData = {
        user_id: '00000000-0000-0000-0000-000000000000'
      };
      
      console.log('Testing with ultra minimal data:', ultraMinData);
      
      const { data: minInsertData, error: minInsertError } = await supabase
        .from('documents')
        .insert([ultraMinData])
        .select();
        
      if (minInsertError) {
        console.error('Insert error with ultra minimal data:', minInsertError);
      } else {
        console.log('Ultra minimal insert success! Data:', minInsertData);
        console.log('Columns in documents table:', Object.keys(minInsertData[0]));
      }
    } else {
      console.log('Minimal insert success! Data:', insertData);
      console.log('Columns in documents table:', Object.keys(insertData[0]));
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables().then(() => {
  console.log('Schema check complete');
}); 