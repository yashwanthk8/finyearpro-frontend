import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkAuto = () => {
  // const [submissions, setSubmissions] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchSubmissions = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.get('http://localhost:5003/submissions');
  //       setSubmissions(response.data.data);
  //       setLoading(false);
  //     } catch (err) {
  //       setError('Failed to fetch submissions: ' + (err.response?.data?.message || err.message));
  //       setLoading(false);
  //     }
  //   };

  //   fetchSubmissions();
  // }, []);

  // const handleDownload = (filename) => {
  //   window.open(`http://localhost:5003/download/${filename}`, '_blank');
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="spinner-border text-primary" role="status">
  //           <span className="sr-only">Loading...</span>
  //         </div>
  //         <p className="mt-4 text-lg">Loading submissions...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 p-8">
  //       <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8">
  //         <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
  //           <p>{error}</p>
  //         </div>
  //         <p>Make sure your MongoDB Atlas connection is properly configured and the server is running.</p>
  //       </div>
  //     </div>
  //   );
  // }

  // return (
  //   <div className="min-h-screen bg-gray-100 p-8">
  //     <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8">
  //       <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
  //         Form Submissions
  //       </h1>

  //       {submissions.length === 0 ? (
  //         <div className="text-center p-8 bg-gray-50 rounded-lg">
  //           <p className="text-gray-600">No submissions found. Submit a form first.</p>
  //         </div>
  //       ) : (
  //         <div className="overflow-x-auto">
  //           <table className="min-w-full bg-white border border-gray-200">
  //             <thead className="bg-gray-100">
  //               <tr>
  //                 <th className="py-3 px-4 border-b text-left">Name</th>
  //                 <th className="py-3 px-4 border-b text-left">Email</th>
  //                 <th className="py-3 px-4 border-b text-left">Phone</th>
  //                 <th className="py-3 px-4 border-b text-left">File</th>
  //                 <th className="py-3 px-4 border-b text-left">Date</th>
  //                 <th className="py-3 px-4 border-b text-left">Actions</th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               {submissions.map((submission) => (
  //                 <tr key={submission._id} className="hover:bg-gray-50">
  //                   <td className="py-3 px-4 border-b">{submission.username}</td>
  //                   <td className="py-3 px-4 border-b">{submission.email}</td>
  //                   <td className="py-3 px-4 border-b">+{submission.phoneCode} {submission.phone}</td>
  //                   <td className="py-3 px-4 border-b">{submission.file.filename}</td>
  //                   <td className="py-3 px-4 border-b">
  //                     {new Date(submission.createdAt).toLocaleString()}
  //                   </td>
  //                   <td className="py-3 px-4 border-b">
  //                     <button
  //                       onClick={() => handleDownload(submission.file.filename)}
  //                       className="px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
  //                     >
  //                       Download
  //                     </button>
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
  return <DataVisualizer />;

};

export default WorkAuto;

              