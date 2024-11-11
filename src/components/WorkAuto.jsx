import React, { useState } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import 'flowbite/dist/flowbite.min.css';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const WorkAuto = () => {
  const [file, setFile] = useState(null);
  const [analyzeData, setAnalyzeData] = useState(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file) {
      alert("Please upload a file");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('File uploaded successfully');
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading file');
    }
  };

  const handleAnalyze = async () => {
    try {
      const response = await fetch('http://localhost:3000/analyze', {
        method: 'GET',
      });
      const data = await response.json();
      setAnalyzeData(data);
      setIsAnalyzed(true);
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('Error analyzing the file');
    }
  };

  return (
    <>
      <div className="flex items-center justify-center w-full">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FaCloudUploadAlt className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV or Excel (XLSX)
              </p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button type="submit" className="mt-4 text-white bg-blue-700 p-2 rounded-lg">
            Upload File
          </button>
        </form>
        <button 
          onClick={handleAnalyze} 
          className="mt-4 text-white bg-green-500 p-2 rounded-lg">
          Analyze File
        </button>
      </div>
      <br/>
      <br/>

      {isAnalyzed && analyzeData && (
       <div
       className="mt-8 flex flex-col items-center"
       style={{ width: '700px', height: '900px', margin: '0 auto' }}
     >
       <h1>Bar Graph</h1>
       <div style={{ width: '80%', maxWidth: '400px' }}>
         <Bar
           data={{
             labels: analyzeData.labels,
             datasets: [
               {
                 label: 'Analysis Data',
                 data: analyzeData.values,
                 backgroundColor: 'rgba(75, 192, 192, 0.6)',
                 borderColor: 'rgba(75, 192, 192, 1)',
                 borderWidth: 1,
               },
             ],
           }}
         />
       </div>
     
       <div style={{ width: '400px', height: '400px', marginTop: '20px' }}
      
        >
         <h1>Pie Chart</h1>
         <Pie
           data={{
             labels: analyzeData.labels,
             datasets: [
               {
                 label: 'Analysis Data',
                 data: analyzeData.values,
                 backgroundColor: [
                   'rgba(255, 99, 132, 0.6)',
                   'rgba(54, 162, 235, 0.6)',
                   'rgba(255, 206, 86, 0.6)',
                   'rgba(75, 192, 192, 0.6)',
                   'rgba(153, 102, 255, 0.6)',
                   'rgba(255, 159, 64, 0.6)',
                 ],
                 borderColor: [
                   'rgba(255, 99, 132, 1)',
                   'rgba(54, 162, 235, 1)',
                   'rgba(255, 206, 86, 1)',
                   'rgba(75, 192, 192, 1)',
                   'rgba(153, 102, 255, 1)',
                   'rgba(255, 159, 64, 1)',
                 ],
                 borderWidth: 1,
               },
             ],
           }}
         />
       </div>
     </div>
     
      )}
    </>
  );
}

export default WorkAuto;
