import React, { useState } from 'react';
import { X, UploadCloud, FileUp } from 'lucide-react';
import API from '../services/api';

export const UploadResourceModal = ({ isOpen, onClose, onResourceUploaded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'Full Stack Web Development',
    semester: 5,
    category: 'Notes'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('semester', formData.semester);
      data.append('category', formData.category);
      data.append('file', file);

      await API.post('/resources', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onResourceUploaded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={22} color="var(--primary)" />
            Upload Academic Resource
          </h2>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Resource Title *</label>
            <input
              type="text"
              name="title"
              required
              className="form-control"
              placeholder="e.g. Unit 3 React Architecture & State Management"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                name="subject"
                required
                className="form-control"
                placeholder="e.g. Full Stack Web Development"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Semester *</label>
              <select
                name="semester"
                className="form-control"
                value={formData.semester}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Resource Category *</label>
            <select
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Notes">Notes</option>
              <option value="Previous Year Paper">Previous Year Paper</option>
              <option value="Lab Manual">Lab Manual</option>
              <option value="Reference Book">Reference Book</option>
              <option value="Syllabus">Syllabus</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              name="description"
              rows="2"
              className="form-control"
              placeholder="Topics covered, university exam year, etc."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* File Picker */}
          <div className="form-group">
            <label className="form-label">Attach File (PDF, DOCX, TXT, ZIP) *</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.zip"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <FileUp size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                  {file ? file.name : 'Click to select file'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Max 15MB file size'}
                </div>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
