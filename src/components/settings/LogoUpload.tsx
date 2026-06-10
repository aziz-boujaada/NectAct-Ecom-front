import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';

type LogoUploadProps = {
  currentLogo?: string;
  onLogoChange: (file: File | null) => void;
  loading?: boolean;
};

export function LogoUpload({ currentLogo, onLogoChange, loading = false }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Call onChange with File object
    onLogoChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onLogoChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setError(null);
  };

  return (
    <div className="logo-upload-section">
      <label className="logo-upload-label">
        Company Logo
        <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>
      </label>

      {preview ? (
        <div className="logo-preview-container">
          <div className="logo-preview">
            <img src={preview} alt="Company logo preview" className="logo-preview-image" />
          </div>
          <button
            className="logo-remove-button secondary-action"
            onClick={handleRemove}
            type="button"
            disabled={loading}
            aria-label="Remove logo"
          >
            <X size={16} />
            Remove Logo
          </button>
        </div>
      ) : (
        <div
          className={`logo-upload-zone ${dragActive ? 'active' : ''} ${error ? 'error' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={loading}
            aria-label="Upload company logo"
            style={{ display: 'none' }}
          />
          <Upload size={32} className="upload-icon" />
          <h4>Drag & drop your logo here</h4>
          <p className="text-muted">or click to browse</p>
          <span className="upload-hint">PNG, JPG, GIF up to 5MB</span>
        </div>
      )}

      {error && (
        <div className="validation-error" style={{ marginTop: '12px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
