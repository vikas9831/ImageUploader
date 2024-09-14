import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    validateFile(file);
  };

  const validateFile = (file) => {
    const fileSize = file.size / 1024 / 1024;
    const validTypes = ["image/jpeg", "image/png"];

    if (!validTypes.includes(file.type)) {
      setError("Only .jpg and .png formats are allowed");
      return;
    }
    if (fileSize > 1) {
      setError("File size exceeds 1MB");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleUpload = async () => {
    if (!image) {
      setError("Please select a valid image");
      return;
    }

    setUploading(true); 
    setUploadProgress(0); 

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "react_preset");
    formData.append("folder", "SimplifiLabs");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dxciq1y9t/image/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress); 
          },
        }
      );
      const uploadedImage = response.data;
      setUploading(false); 
      navigate("/image-details", { state: { uploadedImage } });
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploading(false);
      setError("Failed to upload. Please try again.");
    }
  };

  const resetImage = () => {
    setImage(null);
    setImagePreview(null);
    setError("");
    document.querySelector("#fileInput").value = "";
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      validateFile(file);
    }
  };

  const handleButtonClick = () => {
    document.querySelector("#fileInput").click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full p-6 mt-20">
      <div className="w-full max-w-xl flex flex-col items-center">
      
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              
              <svg
                className="animate-spin text-blue-600"
                viewBox="0 0 36 36"
                width="100"
                height="100"
              >
                <circle
                  className="text-gray-300"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  cx="18"
                  cy="18"
                  r="16"
                />
                <circle
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  cx="18"
                  cy="18"
                  r="16"
                  strokeDasharray="100"
                  strokeDashoffset={100 - (100 * uploadProgress) / 100}
                />
              </svg>
             
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center ml-2">
                <p className="text-lg font-bold">{uploadProgress}%</p>
              </div>
            </div>
            <p className="text-gray-600 mt-4 ml-7 text-center">Uploading...</p>
          </div>
        ) : (
          <>
            
            <div
              className={`w-full p-6 bg-slate-100 rounded-xl shadow-lg flex flex-col items-center justify-center border-4 ${
                dragActive ? "border-blue-500" : "border-dashed border-orange-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{ height: "300px" }}
            >
              <input
                id="fileInput"
                type="file"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div
                className="flex flex-col items-center justify-center w-full h-full p-4 cursor-pointer"
                onClick={handleButtonClick}
              >
                <p className="text-gray-600 text-center text-xl font-serif">
                  Drag & Drop Image here OR Click to select images (Max size: 1 MB)
                </p>
              </div>
              {error && (
                <p className="text-red-500 mt-4 font-bold text-center text-xl">
                  {error}
                </p>
              )}

              <button
                onClick={handleUpload}
                disabled={!image}
                className="mt-4 px-6 py-2 font-semibold text-white bg-blue-700 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Upload
              </button>
            </div>

          
            {imagePreview && (
              <div className="w-full mt-8 flex flex-col items-center">
                <h3 className="text-xl font-mono font-extrabold mb-4 mt-10">
                  Preview Image Before Uploading!
                </h3>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-lg h-auto object-cover border-4 border-gray-300 rounded-lg"
                  style={{ maxHeight: "500px" }}
                />
                <button
                  onClick={resetImage}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reset Image
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
