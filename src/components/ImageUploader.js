import { useState } from "react";

export default function ImageUploader({ onUpload }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "Shake Hub"); // Check in Cloudinary settings
    formData.append("api_key", "419627287449838"); // Explicitly pass the API key
  
    setLoading(true);
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/djtjbc4ee/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      const data = await response.json();
      console.log("Cloudinary Response:", data);
  
      if (data.secure_url) {
        onUpload(data.secure_url);
        alert("Image uploaded successfully!");
      } else {
        alert(`Upload failed: ${data.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong. Check the console for details.");
    }
  
    setLoading(false);
  };
  

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
