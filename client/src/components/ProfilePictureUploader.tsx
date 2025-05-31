import React, { useRef, useState } from 'react';

const backendUrl = "http://localhost:3000";

export function ProfilePictureUploader({ current, onUpload }: { current?: string, onUpload: (url: string) => void }) {
  const [preview, setPreview] = useState<string | undefined>(current);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('profilePicture', file);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/user/profile-picture', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
      const data = await res.json();
      setLoading(false);
      if (data.profilePicture) onUpload(data.profilePicture);
      else alert(data.message || "Upload failed");
    } catch (err) {
      setLoading(false);
      alert("Network or server error");
    }
  };

  return (
    <div>
      <img
        src={preview ? backendUrl + preview : '/placeholder.svg'}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border mb-2"
      />
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        className="btn"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Change Picture'}
      </button>
    </div>
  );
}