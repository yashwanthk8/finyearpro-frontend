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
        // Extract the file extension from the filename
        const fileExtension = filename.split('.').pop().toLowerCase();
        console.log(`Attempting to download file: ${filename} with extension: ${fileExtension}`);
        
        // Force download for all files by default
        let downloadUrl = url;
        
        // For Cloudinary URLs, modify appropriately
        if (url && url.includes('cloudinary.com')) {
            // Special handling for different file types
            if (['xlsx', 'xls', 'csv'].includes(fileExtension)) {
                // Excel/CSV files are stored as raw
                if (url.includes('/image/upload/')) {
                    downloadUrl = url.replace('/image/upload/', '/raw/upload/fl_attachment/');
                } else if (url.includes('/raw/upload/')) {
                    downloadUrl = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
                } else {
                    downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
                }
            } else {
                // For other files (PDFs, images, etc.)
                downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');
            }
            
            // Check if the URL already has the extension
            if (!downloadUrl.endsWith(`.${fileExtension}`)) {
                // Avoid duplicate extensions by checking if extension is already present
                if (!downloadUrl.includes(`.${fileExtension}?`)) {
                    // Add extension before any query params
                    const urlParts = downloadUrl.split('?');
                    if (urlParts.length > 1) {
                        downloadUrl = `${urlParts[0]}.${fileExtension}?${urlParts[1]}`;
                    } else {
                        downloadUrl = `${downloadUrl}.${fileExtension}`;
                    }
                }
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
                                <p className="text-sm text-gray-500 mb-1">
                                    Type: {submission.file.extension ? submission.file.extension.toUpperCase() : submission.file.contentType.split('/')[1]}
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