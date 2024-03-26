import React, { useState } from 'react';
import './App.css';
import Home from './Home';

function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recognizedPerson, setRecognizedPerson] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload_photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to recognize person');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const matches = data.matches;
      if (matches.length > 0) {
        setRecognizedPerson(matches[0].fullName);
      } else {
        setErrorMessage('Person cannot be recognized');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="App">
  
      <Home/>
    </div>
    
  );
}

export default App;
