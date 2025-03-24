import React, { useState, useEffect } from "react";
import axios from "axios";

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await axios.get("https://finyearpro-backend1.onrender.com/submissions");
            console.log("Submissions data:", response.data);
            setSubmissions(response.data.data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching submissions:", err);
            setError("Failed to load submissions. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (url, filename) => {
        // Get file extension to determine how to handle it
        const fileExtension = filename.split('.').pop().toLowerCase();
        
        // Force download for all files by default
        let downloadUrl = url;
        
        // For Cloudinary URLs, add fl_attachment to force download
        if (url && url.includes('cloudinary.com')) {
            if (['xlsx', 'xls', 'csv'].includes(fileExtension)) {
                // Excel/CSV files are stored as raw, so the URL should have /raw/upload/
                if (url.includes('/image/upload/')) {
                    downloadUrl = url.replace('/image/upload/', '/raw/upload/fl_attachment/');
                } else {
                    downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
                }
            } else {
                // For other files
                downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
            }
        }
        
        console.log('Opening download URL:', downloadUrl);
        window.open(downloadUrl, '_blank');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">All Submissions</h1>
            
            {loading && (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                    {error}
                </div>
            )}
            
            {!loading && submissions.length === 0 && !error && (
                <div className="bg-yellow-100 text-yellow-700 p-4 rounded">
                    No submissions found.
                </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {submissions.map((submission) => (
                    <div key={submission._id} className="border rounded-lg overflow-hidden shadow-md bg-white">
                        <div className="p-4">
                            <h2 className="text-lg font-semibold mb-2">{submission.username}</h2>
                            <p className="text-gray-600 mb-1">Email: {submission.email}</p>
                            <p className="text-gray-600 mb-3">Phone: +{submission.phoneCode} {submission.phone}</p>
                            
                            <div className="border-t pt-3 mt-3">
                                <h3 className="font-medium mb-2">Uploaded File:</h3>
                                <p className="text-sm text-gray-500 mb-1">
                                    {submission.file.filename || "Unnamed file"}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">
                                    {(submission.file.size / 1024).toFixed(2)} KB • {new Date(submission.createdAt).toLocaleString()}
                                </p>
                                
                                <button
                                    onClick={() => handleDownload(submission.file.url, submission.file.filename)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full"
                                >
                                    View/Download File
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Submissions; 