import React, { useState } from 'react';

// CSS is now embedded directly in the component to resolve the import error.
const AppStyles = () => {
  const styles = `
    :root {
      --primary-green: #2e7d32;
      --light-green: #e8f5e9;
      --dark-text: #333;
      --light-text: #666;
      --border-color: #e0e0e0;
      --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f4f6f8;
    }
    .App {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .app-header {
      width: 100%;
      background-color: white;
      text-align: center;
      padding: 15px 0;
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow);
    }
    .app-header h1 {
      margin: 0;
      color: var(--primary-green);
      font-size: 1.8em;
    }
    .main-content {
      width: 100%;
      max-width: 1200px;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .upload-section {
      background-color: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      box-shadow: var(--shadow);
      width: 100%;
      max-width: 550px;
    }
    .upload-section h2 {
      margin-top: 0;
      font-size: 2em;
      color: var(--dark-text);
    }
    .upload-section p {
      color: var(--light-text);
      margin-bottom: 30px;
    }
    input[type="file"] {
      display: none;
    }
    .upload-button {
      background-color: var(--primary-green);
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1em;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: background-color 0.3s ease;
    }
    .upload-button:hover {
      background-color: #388e3c;
    }
    .results-container {
      margin-top: 40px;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      align-items: start;
    }
    .image-preview-card, .results-card {
      background-color: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: var(--shadow);
    }
    .image-preview-card h3, .results-card h3 {
      margin-top: 0;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 15px;
      margin-bottom: 20px;
      color: var(--dark-text);
    }
    .image-preview-card img {
      width: 100%;
      border-radius: 8px;
      object-fit: cover;
    }
    .disease-name {
      font-size: 1.8em;
      font-weight: bold;
      color: var(--primary-green);
      margin: 0;
    }
    .confidence-score {
      background-color: var(--light-green);
      color: var(--primary-green);
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.9em;
      margin-top: 15px;
    }
    .results-card h4 {
      margin-top: 30px;
      margin-bottom: 10px;
      color: var(--dark-text);
    }
    .recommendations {
      color: var(--light-text);
      line-height: 1.6;
    }
    .error-card {
      border-left: 5px solid #d32f2f;
    }
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid var(--primary-green);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-top: 40px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (max-width: 900px) {
      .results-container {
        grid-template-columns: 1fr;
      }
    }
  `;
  return <style>{styles}</style>;
};

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
      // ✅ Use your final Render backend URL
      const response = await fetch('https://agrivision-project.onrender.com/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      // Correctly set the state with the full response from the backend
      setResult({
        diseaseName: data.prediction,
        confidence: (data.confidence * 100).toFixed(1) + "%", // Format confidence
        recommendations: data.recommendation,
      });

    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Could not connect to the server." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppStyles />
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
    </>
  );
}

export default App;

