import React, { useState } from "react";
import axios from "axios";

const Auto = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phoneCode: "",
        phone: "",
        file: null,
    });
    
    // Add state for submission status
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState({ success: false, message: "" });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileUploading, setFileUploading] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                setSubmitResult({
                    success: false,
                    message: "File size exceeds 10MB limit. Please select a smaller file."
                });
                return;
            }
            
            // Check if it's an Excel/CSV file by extension
            const fileName = file.name.toLowerCase();
            const isExcel = fileName.endsWith('.xlsx') || 
                           fileName.endsWith('.xls') || 
                           fileName.endsWith('.csv');
            
            // Get file type - handle empty MIME types for some Excel files
            const fileType = file.type || 
                            (isExcel ? 'application/vnd.ms-excel' : '');
            
            console.log("File details:", {
                name: file.name,
                type: fileType,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                extension: file.name.split('.').pop()
            });
            
            // Reset any previous error messages
            setSubmitResult({ success: false, message: "" });
            
            // Start upload progress simulation
            setFileUploading(true);
            setFileUploaded(false);
            setUploadProgress(0);
            
            // Simulate file upload progress
            const simulateUpload = () => {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 10;
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(interval);
                        setFileUploaded(true);
                        setFileUploading(false);
                    }
                    setUploadProgress(Math.min(progress, 100));
                }, 300);
            };
            
            simulateUpload();
            
            // Update form data with file
            setFormData({
                ...formData,
                file: file,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // Append form fields
        data.append("username", formData.username);
        data.append("email", formData.email);
        data.append("phoneCode", formData.phoneCode);
        data.append("phone", formData.phone);

        // Append file
        if (formData.file) {
            // Check file size before uploading
            if (formData.file.size > 10 * 1024 * 1024) {
                setSubmitResult({
                    success: false,
                    message: "File size exceeds 10MB limit. Please select a smaller file."
                });
                return;
            }
            
            data.append("file", formData.file);
            console.log("File added to form data:", formData.file.name, formData.file.type, formData.file.size);
        } else {
            setSubmitResult({
                success: false,
                message: "Please upload a file"
            });
            return;
        }

        setSubmitting(true);
        setSubmitResult({ success: false, message: "" });

        try {
            // Make POST request to backend server
            console.log("Sending request to backend...");
            console.log("File being sent:", {
                name: formData.file.name,
                type: formData.file.type,
                size: formData.file.size
            });
            
            const response = await axios.post("https://finyearpro-backend1.onrender.com/upload", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log(`Upload progress: ${percentCompleted}%`);
                    setUploadProgress(percentCompleted);
                },
                timeout: 120000 // 2 minute timeout for larger files
            });
            
            // Show success animation
            setShowSuccessAnimation(true);
            
            setTimeout(() => {
                setSubmitResult({ 
                    success: true, 
                    message: response.data.message || "Form submitted successfully! Data saved to MongoDB Atlas." 
                });
                
                // Reset form after successful submission
                setFormData({
                    username: "",
                    email: "",
                    phoneCode: "",
                    phone: "",
                    file: null,
                });
                
                // Reset file input and states
                document.querySelector('input[type="file"]').value = '';
                setFileUploaded(false);
                setUploadProgress(0);
                
                // Hide success animation after a delay
                setTimeout(() => {
                    setShowSuccessAnimation(false);
                }, 3000);
                
            }, 1000);
            
            console.log("Server response:", response.data);
            
        } catch (error) {
            console.error("Error submitting the form:", error);
            
            let errorMessage = "Failed to submit the form. Please try again.";
            
            if (error.response) {
                console.error("Error status:", error.response.status);
                console.error("Error response data:", JSON.stringify(error.response.data));
                
                // Handle specific error responses
                if (error.response.status === 500) {
                    errorMessage = "Server error. Please try again later or contact support.";
                } else if (error.response.status === 413) {
                    errorMessage = "File is too large. Please upload a smaller file (max 10MB).";
                } else if (error.response.status === 400) {
                    if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else {
                        errorMessage = "Invalid form data. Please check your inputs and file format.";
                    }
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received:", error.request);
                errorMessage = "No response received from server. Please check your internet connection.";
            } else {
                // Something happened in setting up the request
                errorMessage = error.message || "An unexpected error occurred.";
            }
            
            setSubmitResult({ 
                success: false, 
                message: errorMessage
            });
            
            // Reset progress on error
            setUploadProgress(0);
            setFileUploading(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md p-6 bg-white rounded-lg shadow-md relative"
            >
                {/* Success Animation Overlay */}
                {showSuccessAnimation && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                        <div className="text-center">
                            <div className="success-checkmark">
                                <div className="check-icon">
                                    <span className="icon-line line-tip"></span>
                                    <span className="icon-line line-long"></span>
                                    <div className="icon-circle"></div>
                                    <div className="icon-fix"></div>
                                </div>
                            </div>
                            <p className="text-lg font-medium text-green-600 mt-4">Successfully Submitted!</p>
                        </div>
                    </div>
                )}
                
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Submit Your Information
                </h2>

                {submitResult.message && !showSuccessAnimation && (
                    <div className={`mb-4 p-3 rounded ${submitResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {submitResult.message}
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter Name"
                        required
                        value={formData.username}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        required
                        value={formData.email}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="phoneCode" className="block text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <div className="flex mt-1">
                        <select
                            name="phoneCode"
                            required
                            value={formData.phoneCode}
                            className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleChange}
                        >
                            <option value="" hidden>Code</option>
                            <option value="91">+91</option>
                            <option value="98">+98</option>
                            <option value="99">+99</option>
                            <option value="90">+90</option>
                            <option value="66">+66</option>
                        </select>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="812XXXXXX"
                            required
                            value={formData.phone}
                            className="flex-grow p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                        Upload File (max 10MB)
                    </label>
                    <div className="mt-1 relative">
                        <input
                            type="file"
                            name="file"
                            id="file"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                            required
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="file"
                            className={`flex items-center justify-center px-4 py-2 w-full border ${
                                fileUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300'
                            } rounded cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            {fileUploaded ? (
                                <span className="text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {formData.file ? formData.file.name : "File uploaded successfully"}
                                </span>
                            ) : fileUploading ? (
                                <span className="text-blue-600">Uploading... please wait</span>
                            ) : (
                                <span className="text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Click to browse files
                                </span>
                            )}
                        </label>
                        {fileUploading && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <p className="text-xs text-center mt-1 text-gray-500">{uploadProgress}% uploaded</p>
                            </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Accepted file types: JPG, JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX, CSV (Max 10MB)
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting || !fileUploaded || !formData.file}
                        className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            submitting || !fileUploaded || !formData.file
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
            
            {/* CSS for success animation */}
            <style jsx>{`
                .success-checkmark {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                }
                .success-checkmark .check-icon {
                    width: 80px;
                    height: 80px;
                    position: relative;
                    border-radius: 50%;
                    box-sizing: content-box;
                    border: 4px solid #4CAF50;
                }
                .success-checkmark .check-icon::before {
                    content: "";
                    position: absolute;
                    top: 3px;
                    left: -2px;
                    width: 30px;
                    height: 15px;
                    border-radius: 10px;
                    transform: rotate(-45deg);
                    background: #fff;
                }
                .success-checkmark .check-icon::after {
                    content: "";
                    position: absolute;
                    top: 46px;
                    left: 35px;
                    width: 15px;
                    height: 25px;
                    border-radius: 10px;
                    transform: rotate(-45deg);
                    background: #fff;
                }
                .success-checkmark .check-icon .icon-line {
                    height: 5px;
                    background-color: #4CAF50;
                    display: block;
                    border-radius: 2px;
                    position: absolute;
                    z-index: 10;
                }
                .success-checkmark .check-icon .icon-line.line-tip {
                    top: 46px;
                    left: 14px;
                    width: 25px;
                    transform: rotate(45deg);
                    animation: icon-line-tip 0.75s;
                }
                .success-checkmark .check-icon .icon-line.line-long {
                    top: 38px;
                    right: 8px;
                    width: 47px;
                    transform: rotate(-45deg);
                    animation: icon-line-long 0.75s;
                }
                .success-checkmark .check-icon .icon-circle {
                    top: -4px;
                    left: -4px;
                    z-index: 10;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    position: absolute;
                    box-sizing: content-box;
                    border: 4px solid rgba(76, 175, 80, .5);
                }
                .success-checkmark .check-icon .icon-fix {
                    top: 8px;
                    width: 5px;
                    left: 26px;
                    z-index: 1;
                    height: 85px;
                    position: absolute;
                    transform: rotate(-45deg);
                    background-color: #fff;
                }
                @keyframes icon-line-tip {
                    0% {
                        width: 0;
                        left: 1px;
                        top: 19px;
                    }
                    54% {
                        width: 0;
                        left: 1px;
                        top: 19px;
                    }
                    70% {
                        width: 50px;
                        left: -8px;
                        top: 37px;
                    }
                    84% {
                        width: 17px;
                        left: 21px;
                        top: 48px;
                    }
                    100% {
                        width: 25px;
                        left: 14px;
                        top: 46px;
                    }
                }
                @keyframes icon-line-long {
                    0% {
                        width: 0;
                        right: 46px;
                        top: 54px;
                    }
                    65% {
                        width: 0;
                        right: 46px;
                        top: 54px;
                    }
                    84% {
                        width: 55px;
                        right: 0px;
                        top: 35px;
                    }
                    100% {
                        width: 47px;
                        right: 8px;
                        top: 38px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Auto;
