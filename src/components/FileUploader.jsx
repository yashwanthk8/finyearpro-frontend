import React from 'react';
import * as XLSX from 'xlsx';

const FileUploader = ({ setData, setColumns, setSelectedXColumn, setSelectedYColumn }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData && jsonData.length > 0) {
        setData(jsonData);
        const columnKeys = Object.keys(jsonData[0] || {});
        setColumns(columnKeys);
        
        // Set default selected columns if available
        if (columnKeys.length >= 2) {
          setSelectedXColumn && setSelectedXColumn(columnKeys[0]);
          setSelectedYColumn && setSelectedYColumn(columnKeys[1]);
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Upload your data file</h2>
      <input 
        type="file" 
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      <p className="mt-2 text-sm text-gray-500">
        Upload Excel or CSV files to analyze their data
      </p>
    </div>
  );
};

export default FileUploader; 