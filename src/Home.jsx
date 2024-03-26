import React, { useState } from 'react';

function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recognizedPerson, setRecognizedPerson] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleImageUpload = async (file) => {
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
        setUploadedImage(URL.createObjectURL(file));
      } else {
        setErrorMessage('Person cannot be recognized');
        setRecognizedPerson(null);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setRecognizedPerson(null);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
  
      const video = document.createElement('video');
      video.srcObject = mediaStream;
      video.play();
  
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      // Wait for the video to be loaded and ready
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
        setUploadedImage(imageDataUrl);
        // Convert canvas content to Blob
        canvas.toBlob(blob => {
          if (blob) {
            handleImageUpload(blob); // Send Blob to handleImageUpload function
          }
        }, 'image/jpeg', 1); // Specify JPEG format and quality (1 is the highest quality)
  
        // Stop video stream
        mediaStream.getTracks().forEach(track => track.stop());
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };
  
  
  return (
    <div className="flex flex-col h-screen">
      <header className="p-4">
        <div className="flex items-center space-x-4">
          <a className="flex items-center space-x-2" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
            <span className="text-lg font-bold">Varun OP</span>
          </a>
          <button onClick={handleTakePhoto} className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
            Take Photo
          </button>
          <label htmlFor="upload" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
            Upload Photo
          </label>
          <input type="file"
                 accept="image/*"
                 onChange={(event) => handleImageUpload(event.target.files[0])}
                 id='upload'
                 className="hidden" />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-[400px]">
            <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-lg w-full h-[300px] flex items-center justify-center " style={{objectFit: 'cover'}}>
              {uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="max-h-full max-w-full" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-300 dark:text-gray-700 translate-y-1">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                </svg>
              )}
            </div>
          </div>
        </div>
        <div className="text-center space-y-2 p-4">
          {errorMessage ? (
            <React.Fragment>
              <h1 className="text-3xl font-bold text-red-500">Error</h1>
              <p className="text-gray-500 dark:text-gray-400">{errorMessage}</p>
            </React.Fragment>
          ) : recognizedPerson ? (
            <React.Fragment>
              <h1 className="text-3xl font-bold text-green-500">Recognized Person</h1>
              <p className="text-gray-500 text-3xl dark:text-gray-400">{recognizedPerson}</p>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h1 className="text-3xl font-bold">No face detected</h1>
              <p className="text-gray-500 dark:text-gray-400">Try uploading another photo</p>
            </React.Fragment>
          )}
        </div>
      </main>
      
    </div>
  );
}

export default Home;
