// Author: Radha Pandey, CSE - CampusConnect
import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import Pagination from '../components/Pagination';

export default function AdminResources() {
  const [form, setForm] = useState({ title: '', subject: '', semester: '1' });
  const [file, setFile] = useState(null);
  const [list, setList] = useState({ data: [], totalPages: 1 });
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    api.get('/resources', { params: { page, limit: 10 } }).then((r) => setList(r.data)).catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
  }, [page, reload]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pick = (e) => {
    const f = e.target.files[0];
    if (f && !/\.(pdf|docx)$/i.test(f.name)) {
      setMsg({ type: 'error', text: 'Only PDF and DOCX files are allowed' });
      e.target.value = '';
      return setFile(null);
    }
    if (f && f.size > 10 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'File must be 10 MB or smaller' });
      e.target.value = '';
      return setFile(null);
    }
    setMsg({ type: '', text: '' });
    setFile(f || null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 3) return setMsg({ type: 'error', text: 'Title must be at least 3 characters' });
    if (form.subject.trim().length < 2) return setMsg({ type: 'error', text: 'Subject is required' });
    if (!file) return setMsg({ type: 'error', text: 'Choose a PDF or DOCX file' });
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('file', file);
    try {
      await api.post('/resources', fd);
      setMsg({ type: 'ok', text: 'Resource uploaded' });
      setForm({ title: '', subject: '', semester: '1' });
      setFile(null);
      e.target.reset();
      setReload((n) => n + 1);
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.title}"?`)) return;
    try {
      await api.delete(`/resources/${r.id}`);
      setReload((n) => n + 1);
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  return (
    <>
      <form className="card form" onSubmit={submit}>
        <h3>Upload resource</h3>
        {msg.text && <p className={msg.type === 'ok' ? 'ok' : 'error'}>{msg.text}</p>}
        <input placeholder="Title" value={form.title} onChange={set('title')} />
        <input placeholder="Subject (e.g. DBMS)" value={form.subject} onChange={set('subject')} />
        <select value={form.semester} onChange={set('semester')}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <input type="file" accept=".pdf,.docx" onChange={pick} />
        <button>Upload</button>
      </form>

      <div className="card table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Subject</th><th>Sem</th><th>File</th><th></th></tr></thead>
          <tbody>
            {list.data.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td><td>{r.subject}</td><td>{r.semester}</td><td>{r.originalName}</td>
                <td><button className="link danger" onClick={() => remove(r)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={list.totalPages} onChange={setPage} />
      </div>
    </>
  );
}
