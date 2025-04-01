import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { uploadDocumentMetadata } from "../supabase";
import Navbarm from "./Navbarm";

const Auto = () => {
    const { user } = useAuth();
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

    // Create empty refs for the Navbarm component
    const heroRef = useRef(null);
    const stepwiseRef = useRef(null);
    const featuresRef = useRef(null);
    const benefitsRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            setFileUploading(true);
            
            // Simulate upload progress for better UX
            const interval = setInterval(() => {
                setUploadProgress((prevProgress) => {
                    const newProgress = prevProgress + 5;
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        setFileUploading(false);
                        setFileUploaded(true);
                        return 100;
                    }
                    return newProgress;
                });
            }, 200);
            
            setFormData({
                ...formData,
                file,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            setSubmitResult({ success: false, message: "" });
            
            // Create form data object for file upload
            const data = new FormData();
            data.append("username", formData.username);
            data.append("email", formData.email);
            data.append("phoneCode", formData.phoneCode);
            data.append("phone", formData.phone);
            
            if (formData.file) {
                data.append("file", formData.file);
            }
            
            // Submit the form to your backend
            const response = await axios.post("https://finyearpro-backend1.onrender.com/upload", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });
            
            // Show success animation
            setShowSuccessAnimation(true);
            
            // Log full response for debugging
            console.log("FULL server response:", JSON.stringify(response.data));
            
            // Save document metadata to Supabase if the user is logged in
            if (user && response.data && response.data.file) {
                const fileExtension = response.data.file.filename.split('.').pop().toLowerCase();
                
                console.log("File from server response:", response.data.file);
                console.log("File mimetype:", response.data.file?.mimetype);
                
                // Create mime type from extension if not provided
                const mimeType = response.data.file.mimetype || 
                    (fileExtension === 'pdf' ? 'application/pdf' : 
                    fileExtension === 'csv' ? 'text/csv' : 
                    fileExtension === 'xlsx' || fileExtension === 'xls' ? 'application/vnd.ms-excel' :
                    fileExtension === 'doc' || fileExtension === 'docx' ? 'application/msword' :
                    `application/${fileExtension}`);
                
                const documentData = {
                    user_id: user.id,
                    file_name: response.data.file.filename,
                    filename: response.data.file.filename, // Add filename field as well
                    file_type: mimeType, // Use our determined mime type
                    file_extension: fileExtension,
                    file_size: response.data.file.size,
                    file_url: response.data.file.url,
                    description: `Uploaded via Auto form`,
                    created_at: new Date().toISOString(),
                    source: 'auto_form', // Explicitly set source
                    source_label: 'Uploaded from Auto Form' // Explicitly set source_label
                };
                
                console.log("Preparing to upload document metadata to Supabase:", documentData);
                
                // Upload document metadata to Supabase
                try {
                    const { data: metadataResult, error } = await uploadDocumentMetadata(documentData);
                    
                    if (error) {
                        console.error("Error saving document metadata to Supabase:", error);
                        // Log more details about the error
                        if (error.details) console.error("Error details:", error.details);
                        if (error.hint) console.error("Error hint:", error.hint);
                        if (error.code) console.error("Error code:", error.code);
                        
                        // Show error in UI
                        setSubmitResult({ 
                            success: false, 
                            message: `Form submitted to server but failed to save to database: ${error.message || 'Unknown error'}` 
                        });
                    } else {
                        console.log("Document metadata saved to Supabase:", metadataResult);
                        setSubmitResult({ 
                            success: true, 
                            message: "Form submitted successfully! Document saved to your dashboard." 
                        });
                    }
                } catch (uploadError) {
                    console.error("Exception during Supabase upload:", uploadError);
                    setSubmitResult({ 
                        success: false, 
                        message: `Form submitted but error saving to database: ${uploadError.message}` 
                    });
                }
            } else {
                console.warn("Skipping Supabase upload because:", {
                    userExists: !!user,
                    responseDataExists: !!response.data,
                    fileExists: !!(response.data && response.data.file)
                });
            }
            
            setTimeout(() => {
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
            console.error("Error submitting form:", error);
            
            // Determine the error message
            let errorMessage = "An error occurred while submitting the form.";
            
            if (error.response) {
                // The request was made and the server responded with an error status
                errorMessage = error.response.data.message || error.response.data.error || errorMessage;
                console.error("Server error response:", error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "The server did not respond. Please try again later.";
                console.error("No response from server:", error.request);
            } else {
                // Something happened in setting up the request
                errorMessage = error.message || errorMessage;
                console.error("Request error:", error.message);
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
        <>
            <Navbarm 
                scrollToSection={() => {}} 
                sections={{ heroRef, stepwiseRef, featuresRef, benefitsRef }} 
            />
            <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-16">
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

                    <div className="mb-4 grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                            <label htmlFor="phoneCode" className="block text-sm font-medium text-gray-700">
                                Code
                            </label>
                            <input
                                type="text"
                                name="phoneCode"
                                placeholder="+91"
                                required
                                value={formData.phoneCode}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-span-3">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Enter Phone Number"
                                required
                                value={formData.phone}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload File
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                            <input
                                type="file"
                                name="file"
                                className="hidden"
                                id="file-upload"
                                onChange={handleFileChange}
                                required
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center text-sm text-gray-500 cursor-pointer"
                            >
                                {fileUploaded ? (
                                    <span className="text-green-600 mt-2">
                                        ✓ {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
                                    </span>
                                ) : (
                                    <>
                                        <svg
                                            className="h-10 w-10 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                        <span className="mt-2">Click to upload or drag and drop</span>
                                    </>
                                )}
                            </label>

                            {fileUploading && (
                                <div className="mt-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-center mt-1">
                                        {uploadProgress}% - Processing file...
                                    </p>
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
            </div>
            
            {/* CSS for success animation */}
            <style jsx>{`
                .success-checkmark {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                }
                
                .check-icon {
                    width: 80px;
                    height: 80px;
                    position: relative;
                    border-radius: 50%;
                    box-sizing: content-box;
                    border: 4px solid #4CAF50;
                }
                
                .check-icon::before {
                    top: 3px;
                    left: -2px;
                    width: 30px;
                    transform-origin: 100% 50%;
                    border-radius: 100px 0 0 100px;
                }
                
                .check-icon::after {
                    top: 0;
                    left: 30px;
                    width: 60px;
                    transform-origin: 0 50%;
                    border-radius: 0 100px 100px 0;
                    animation: rotate-circle 4.25s ease-in;
                }
                
                .check-icon::before, .check-icon::after {
                    content: '';
                    height: 100px;
                    position: absolute;
                    background: #FFFFFF;
                    transform: rotate(-45deg);
                }
                
                .check-icon .icon-line {
                    height: 5px;
                    background-color: #4CAF50;
                    display: block;
                    border-radius: 2px;
                    position: absolute;
                    z-index: 10;
                }
                
                .check-icon .icon-line.line-tip {
                    top: 46px;
                    left: 14px;
                    width: 25px;
                    transform: rotate(45deg);
                    animation: icon-line-tip 0.75s;
                }
                
                .check-icon .icon-line.line-long {
                    top: 38px;
                    right: 8px;
                    width: 47px;
                    transform: rotate(-45deg);
                    animation: icon-line-long 0.75s;
                }
                
                .check-icon .icon-circle {
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
                
                .check-icon .icon-fix {
                    top: 8px;
                    width: 5px;
                    left: 26px;
                    z-index: 1;
                    height: 85px;
                    position: absolute;
                    transform: rotate(-45deg);
                    background-color: #FFFFFF;
                }
                
                @keyframes rotate-circle {
                    0% {
                        transform: rotate(-45deg);
                    }
                    5% {
                        transform: rotate(-45deg);
                    }
                    12% {
                        transform: rotate(-405deg);
                    }
                    100% {
                        transform: rotate(-405deg);
                    }
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
                        top: 45px;
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
        </>
    );
};

export default Auto;
