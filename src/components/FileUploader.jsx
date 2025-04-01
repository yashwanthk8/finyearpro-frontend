import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { useAuth } from '../contexts/AuthContext';
import { uploadWorkAutoDocument } from '../supabase';

const FileUploader = ({ setData, setColumns }) => {
  const { user } = useAuth();
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedDocumentId, setUploadedDocumentId] = useState(null);

  const handleFileUpload = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      setUploadStatus('Please select a file');
      return;
    }

    setUploadStatus('Reading file...');
    const file = acceptedFiles[0];
    
    // Get file details for metadata
    const fileType = file.type || 'application/octet-stream';
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileSize = file.size;
    
    console.log('File details:', {
      name: file.name,
      type: fileType,
      extension: fileExtension,
      size: fileSize
    });

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          setUploadStatus('Processing file...');
          
          // Process based on file type
          let jsonData = [];
          let sheetColumns = [];
          
          if (fileExtension === 'csv') {
            // Process CSV
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
            sheetColumns = Object.keys(jsonData[0] || {});
          } else if (['xlsx', 'xls'].includes(fileExtension)) {
            // Process Excel
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
            sheetColumns = Object.keys(jsonData[0] || {});
          } else if (fileExtension === 'json') {
            // Process JSON
            jsonData = JSON.parse(data);
            sheetColumns = Object.keys(jsonData[0] || {});
          } else {
            setUploadStatus(`Unsupported file type: ${fileExtension}`);
            return;
          }
          
          // Check if we have data
          if (!jsonData.length) {
            setUploadStatus('The file contains no data');
            return;
          }
          
          // Upload file metadata to Supabase
          if (user) {
            setUploadStatus('Saving document metadata...');
            const documentData = {
              user_id: user.id,
              filename: file.name,
              file_type: fileType,
              file_extension: fileExtension,
              file_size: fileSize,
              source: 'work_auto',
              source_label: 'Uploaded from Work Auto'
            };
            
            // Upload to work_documents table
            const { data: savedDoc, error } = await uploadWorkAutoDocument(documentData);
            
            if (error) {
              console.error('Error saving document metadata:', error);
              setUploadStatus(`Error: ${error.message}`);
              return;
            }
            
            console.log('Document saved with ID:', savedDoc[0].id);
            setUploadedDocumentId(savedDoc[0].id);
            
            // Add the document ID to the data for later use in analysis
            jsonData = jsonData.map(item => ({
              ...item,
              documentId: savedDoc[0].id
            }));
          }
          
          // Update states with the processed data
          setData(jsonData);
          setColumns(sheetColumns);
          setUploadStatus('File uploaded successfully');
        } catch (error) {
          console.error('Error processing file:', error);
          setUploadStatus(`Error: ${error.message}`);
        }
      };
      
      reader.onerror = () => {
        setUploadStatus('Failed to read file');
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Exception in file upload:', error);
      setUploadStatus(`Error: ${error.message}`);
    }
  }, [user, setData, setColumns]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: handleFileUpload,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    }
  });

  return (
    <div className="mb-8">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 hover:bg-gray-50 transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="mt-1 text-sm text-gray-600">
            {isDragActive
              ? "Drop the file here..."
              : "Drag and drop your data file here, or click to select a file"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: Excel (.xlsx, .xls), CSV (.csv), JSON (.json)
          </p>
        </div>
      </div>
      
      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-md ${
          uploadStatus.includes('Error') 
            ? 'bg-red-50 text-red-800' 
            : uploadStatus.includes('success') 
              ? 'bg-green-50 text-green-800'
              : 'bg-blue-50 text-blue-800'
        }`}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default FileUploader; 