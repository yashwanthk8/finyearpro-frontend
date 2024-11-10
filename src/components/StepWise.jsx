import React from 'react';
import './Step.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUpload, FaChartLine, FaLightbulb } from 'react-icons/fa';

const StepWise = () => {
    const steps = [
        {
            number: 1,
            headline: 'Upload your CSV or Excel file.',
            description: 'Easily upload your data file in CSV or Excel format with just a few clicks. Our system supports various file sizes, ensuring smooth data input.',
            icon: <FaUpload size={30} color="#9B5DE5" />,
        },
        {
            number: 2,
            headline: 'View real-time visualizations of your data',
            description: 'Once uploaded, instantly view dynamic visual representations of your data, including charts and graphs. Understand key trends and patterns at a glance.',
            icon: <FaChartLine size={30} color="#9B5DE5" />,
        },
        {
            number: 3,
            headline: 'Get predictive insights based on your file',
            description: 'Leverage advanced algorithms to predict future trends and business outcomes. Our tool provides actionable insights, helping you make informed decisions.',
            icon: <FaLightbulb size={30} color="#9B5DE5" />,
        },
    ];

    return (
        <div className="container my-5">
            <section>
                <div className="text-center mb-5">
                    <span>STEPS</span>
                    <h2 className="font-weight-bold display-4">
                        How It <span style={{ color: '#9B5DE5' }}>Works?</span>
                    </h2>
                </div>
                <div className="col-12 col-md-6 mx-auto">
                    {steps.map((step) => (
                        <div key={step.number} className="">
                            <div className="bg-light position-relative px-3 my-5">
                                <div
                                    className="font-weight-bold circle text-white rounded-circle d-flex align-items-center justify-content-center mx-auto position-relative border border-white"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        top: '-30px',
                                        borderWidth: '4px !important',
                                        backgroundColor: '#9B5DE5',
                                    }}
                                >
                                    {step.number}
                                </div>
                                <div className="px-3 text-center pb-3">
                                <div className="d-flex justify-content-center align-items-center my-3">{step.icon}</div>
                                    <h4>{step.headline}</h4>
                                    <p className="font-weight-light my-3">{step.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default StepWise;
