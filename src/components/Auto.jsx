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
            
            setFormData({
                ...formData,
                file: e.target.files[0],
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
            data.append("file", formData.file);
        } else {
            alert("Please upload a file");
            return;
        }

        setSubmitting(true);
        setSubmitResult({ success: false, message: "" });

        try {
            // Make POST request to backend server using server1.js endpoint
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
            let errorMessage = "Failed to submit the form";
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage = error.response.data.message || error.response.data.error || errorMessage;
                console.error("Error response data:", error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = "No response received from server. Please try again.";
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message;
            }
            
            setSubmitResult({ 
                success: false, 
                message: errorMessage
            });
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
                        Upload File
                    </label>
                    <input
                        type="file"
                        name="file"
                        required
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleFileChange}
                    />
                    
                    {/* Upload Progress Bar */}
                    {(fileUploading || fileUploaded || uploadProgress > 0) && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className={`h-2.5 rounded-full ${fileUploaded ? 'bg-green-600' : 'bg-blue-600'}`}
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs mt-1 text-gray-500">
                                {fileUploaded 
                                    ? 'File uploaded successfully' 
                                    : fileUploading 
                                        ? `Uploading: ${Math.round(uploadProgress)}%` 
                                        : ''}
                            </p>
                        </div>
                    )}
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
