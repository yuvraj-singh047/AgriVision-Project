// src/App.js
import React, { useState } from 'react';
import './App.css'; // Make sure this is imported

// Upload icon component
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
  </svg>
);

function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setResult(null);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // ✅ Use your Render backend URL
      const response = await fetch('https://agrivision-project.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      setResult({
        diseaseName: data.prediction.replace(/___/g, ' - ').replace(/_/g, ' '),
        confidence: "95.8%", // Placeholder
        recommendations: "Remove infected leaves, ensure proper air circulation, and apply a copper-based fungicide as directed.", // Placeholder
      });

    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Could not connect to the server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌱 AgriVision AI</h1>
      </header>
      <main className="main-content">
        <div className="upload-section">
          <h2>Detect Plant Disease</h2>
          <p>Upload a clear photo of a plant leaf for an instant AI diagnosis.</p>
          <label htmlFor="imageUploader" className="upload-button">
            <UploadIcon />
            Upload Image
          </label>
          <input 
            type="file" 
            id="imageUploader"
            accept="image/*" 
            onChange={handleImageChange} 
          />
        </div>

        {isLoading && <div className="loader"></div>}

        {imagePreview && !isLoading && (
          <div className="results-container">
            <div className="image-preview-card">
              <h3>Your Image</h3>
              <img src={imagePreview} alt="Leaf preview" />
            </div>
            {result && !result.error && (
              <div className="results-card">
                <h3>Analysis Result</h3>
                <p className="disease-name">{result.diseaseName}</p>
                <div className="confidence-score">
                  <strong>Confidence:</strong> {result.confidence}
                </div>
                <h4>Treatment Recommendations</h4>
                <p className="recommendations">{result.recommendations}</p>
              </div>
            )}
            {result && result.error && (
              <div className="results-card error-card">
                 <h3>Error</h3>
                 <p>{result.error}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
