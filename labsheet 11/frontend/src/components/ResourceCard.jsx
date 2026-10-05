import React from 'react';
import { FileText, Download, Trash2, BookMarked, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ResourceCard = ({ resource, onDownload, onDelete, downloadingId }) => {
  const { isAdmin } = useAuth();

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.5 MB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
    >
      {/* Top Category & Semester Tags */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: 'rgba(99, 102, 241, 0.12)',
          color: '#818cf8',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)'
        }}>
          <BookMarked size={13} />
          {resource.category}
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: 'rgba(6, 182, 212, 0.12)',
          color: '#22d3ee',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          padding: '0.2rem 0.6rem',
          borderRadius: 'var(--radius-full)'
        }}>
          <Layers size={13} />
          Sem {resource.semester}
        </span>
      </div>

      {/* File Icon & Title */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          flexShrink: 0
        }}>
          <FileText size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '0.3rem', lineHeight: 1.3 }}>
            {resource.title}
          </h4>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
            {resource.subject}
          </div>
        </div>
      </div>

      {/* Description */}
      {resource.description && (
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {resource.description}
        </p>
      )}

      {/* File metadata & Actions */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '0.785rem', color: 'var(--text-dim)' }}>
          {formatFileSize(resource.fileSize)} • {resource.downloads || 0} downloads
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onDownload(resource)}
            disabled={downloadingId === resource._id}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            <Download size={14} />
            {downloadingId === resource._id ? 'Saving...' : 'Download'}
          </button>

          {isAdmin && (
            <button
              onClick={() => onDelete(resource._id)}
              className="btn btn-danger btn-sm"
              title="Delete Resource"
              style={{ padding: '0.4rem' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
