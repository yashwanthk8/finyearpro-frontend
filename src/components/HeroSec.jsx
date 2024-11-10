import React from 'react'
// import './Hero.css'


const HeroSec = () => {
  return (
   <>
  <div className="flex flex-col md:flex-row h-screen">
      <div className="flex-1 bg-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">Data Analysis & Future Insights!</h1>
          <p className="mt-2">Upload your data for quick insights and future predictions.</p>
          <a
            href="https://spacema-dev.com/free-tailwind-css-templates/"
            className="mt-4 inline-block bg-white text-blue-500 py-2 px-4 rounded"
            target="_blank" // Opens the link in a new tab
            rel="noopener noreferrer" // Security feature
          >
            Upload File
          </a>
        </div>
      </div>
      <div
        className="flex-1 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://img.freepik.com/free-vector/police-officer-online-service-platform-detective-making-interrogation-policeman-patrol-city-community-policing-online-data-base-vector-illustration_613284-2819.jpg?w=1380&t=st=1728672575~exp=1728673175~hmac=319fbded4fd69bfd4f7f9ef4e2222d195b519097a75d2226fa761200bd856eb5')",
        }}
      ></div>
    </div>
   </>
  )
}

export default HeroSec
