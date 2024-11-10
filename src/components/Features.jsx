import React from 'react';
import './Feature.css';
const Features = () => {
  return (
    <div>
      <header className="header">
        {/* <p className="header_subtitle">Reliable, efficient delivery</p> */}
        <h1 className="header_title">Features of this website</h1>
        <p className="header_description">
        Our platform offers seamless data analysis with support for CSV and Excel formats. Easily upload your files to visualize data through interactive charts and graphs, and leverage predictive analytics to forecast trends and profitability. With a user-friendly interface, you can transform raw data into actionable insights in just a few clicks.
        </p>
      </header>

      <main className="card_grid" >
        <div className="card cyan" data-aos="fade-up">
          <h2 className="card_title">Data Visualization</h2>
          <p className="card_content">Instantly convert your data into interactive charts and graphs for quick, actionable insights.</p>
          <iframe
            className="card_img"
            src="https://lottie.host/embed/14fe035a-f3ba-4752-a5b4-d19e2afee883/KvcBdy4yIG.json"
            title="Lottie Animation"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        <section className="card red">
          <h2 className="card_title">Predictive Analytics</h2>
          <p className="card_content">Forecast future trends and profitability with advanced algorithms for smarter, data-driven decisions.</p>
          <div className="iframe_container">
          <iframe
            className="card_img"
            src="https://lottie.host/embed/0ed42ced-cb08-43af-af5a-55ec07092e9d/Qlns7chqIY.json"
            title="Lottie Animation"
            frameBorder="0" 
            allowFullScreen
          ></iframe>
          </div>
        </section>

        <section className="card blue">
          <h2 className="card_title">User-friendly Interface</h2>
          <p className="card_content">Experience a user-friendly interface that simplifies file uploads and delivers results effortlessly.</p>
          <iframe
            className="card_img"
            src="https://lottie.host/embed/255aed28-fc64-4c20-8980-84c285704b4c/6omCq1aqkp.json"
            title="Lottie Animation"
            frameBorder="0" 
            allowFullScreen
          ></iframe>
        </section>

        <section className="card orange">
          <h2 className="card_title">Support for CSV/Excel Formats</h2>
          <p className="card_content">Uses data from past projects to provide better delivery estimates</p>
          <iframe
            className="card_img"
            src="https://lottie.host/embed/697ee1f2-ef23-4d21-96e0-5806b8dc61d0/mwljfOIgkq.json"
            title="Lottie Animation"
            frameBorder="0" 
            allowFullScreen
          ></iframe>
        </section>
      </main>
    </div>
  )
}

export default Features
