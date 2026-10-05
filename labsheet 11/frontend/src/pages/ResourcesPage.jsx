import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Upload, Filter } from 'lucide-react';
import API from '../services/api';
import { ResourceCard } from '../components/ResourceCard';
import { Pagination } from '../components/Pagination';
import { UploadResourceModal } from '../components/UploadResourceModal';
import { useAuth } from '../context/AuthContext';

export const ResourcesPage = () => {
  const { isAdmin } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [semester, setSemester] = useState('All');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResources, setTotalResources] = useState(0);
  const [meta, setMeta] = useState({ subjects: [], semesters: [], categories: [] });

  // Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const categories = ['All', 'Notes', 'Previous Year Paper', 'Lab Manual', 'Reference Book', 'Syllabus'];

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await API.get('/resources/meta');
        setMeta(res.data);
      } catch (e) {
        console.error('Failed to fetch resource meta:', e);
      }
    };
    fetchMeta();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        semester: semester !== 'All' ? semester : undefined,
        category: category !== 'All' ? category : undefined,
        search: search.trim() || undefined
      };

      const res = await API.get('/resources', { params });
      setResources(res.data.resources || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalResources(res.data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [page, semester, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleDownload = async (resource) => {
    setDownloadingId(resource._id);
    try {
      const response = await API.get(`/resources/${resource._id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.fileName || `resource-${resource._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMsg(`"${resource.title}" downloaded successfully!`);
    } catch (err) {
      setError('Failed to download resource. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Permanently delete this resource? This action cannot be undone.')) return;
    try {
      await API.delete(`/resources/${resourceId}`);
      setSuccessMsg('Resource deleted successfully.');
      fetchResources();
    } catch (err) {
      setError(err.message || 'Failed to delete resource.');
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <BookOpen size={16} /> Academic Repository
            </div>
            <h1 style={{ fontSize: '2.25rem', marginTop: '0.2rem' }}>Notes & Resource Library</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Semester-wise notes, previous year papers, lab manuals, and syllabi.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Upload size={18} />
              Upload Resource
            </button>
          )}
        </div>

        {/* Alerts */}
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between'
          }}>
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between'
          }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div style={{
          background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem'
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text" placeholder="Search by title, subject, or keyword..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="form-control" style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Semester:</span>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                value={semester}
                onChange={(e) => { setSemester(e.target.value); setPage(1); }}
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Type:</span>
              {categories.map((cat) => {
                const active = category === cat;
                return (
                  <button key={cat} onClick={() => { setCategory(cat); setPage(1); }} style={{
                    background: active ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: active ? '#22d3ee' : 'var(--text-muted)',
                    border: `1px solid ${active ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-color)'}`,
                    padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            Loading academic resources...
          </div>
        ) : resources.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <BookOpen size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No resources found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Try a different filter combination or search term.
            </p>
          </div>
        ) : (
          <>
            <div className="grid-cards">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  downloadingId={downloadingId}
                />
              ))}
            </div>
            <Pagination
              currentPage={page} totalPages={totalPages}
              totalItems={totalResources} onPageChange={(p) => setPage(p)}
            />
          </>
        )}
      </div>

      <UploadResourceModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onResourceUploaded={fetchResources}
      />
    </div>
  );
};
