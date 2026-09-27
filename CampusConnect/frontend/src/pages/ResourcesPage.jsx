import React, { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import {
    BookOpen,
    Download,
    Upload,
    Search,
    Filter,
    FileText,
    Trash2,
    Calendar,
    GraduationCap,
    CheckCircle2
} from "lucide-react";

const CATEGORIES = ["All", "Notes", "Previous Year Papers", "Syllabus", "Lab Manual", "Assignment", "Reference Material"];

const ResourcesPage = () => {
    const { user, isAdmin } = useAuth();

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

    // Filter states
    const [search, setSearch] = useState("");
    const [semester, setSemester] = useState("All");
    const [category, setCategory] = useState("All");
    const [subject, setSubject] = useState("All");
    const [subjectsList, setSubjectsList] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResources, setTotalResources] = useState(0);

    // Upload Modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        title: "",
        description: "",
        subject: "",
        semester: 6,
        category: "Notes"
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                limit: 10
            });

            if (search.trim()) params.append("search", search.trim());
            if (semester !== "All") params.append("semester", semester);
            if (category !== "All") params.append("category", category);
            if (subject !== "All") params.append("subject", subject);

            const res = await API.get(`/resources?${params.toString()}`);
            if (res.data.success) {
                setResources(res.data.resources);
                setTotalPages(res.data.totalPages || 1);
                setTotalResources(res.data.totalResources || 0);
                if (res.data.subjects) {
                    setSubjectsList(res.data.subjects);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load resources.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [page, semester, category, subject]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchResources();
    };

    // Download handler
    const handleDownload = (resourceId, fileName) => {
        window.open(`/api/resources/${resourceId}/download`, "_blank");
    };

    // Admin Delete handler
    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Are you sure you want to delete this resource file?")) return;

        try {
            const res = await API.delete(`/resources/${resourceId}`);
            if (res.data.success) {
                setActionMsg({ type: "success", text: "Resource deleted successfully." });
                fetchResources();
            }
        } catch (err) {
            setActionMsg({ type: "danger", text: err.response?.data?.message || "Failed to delete resource." });
        }
    };

    // Upload File Submit handler
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a file to upload (PDF, DOCX, etc.)");
            return;
        }

        try {
            setUploadLoading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("title", uploadForm.title);
            formData.append("description", uploadForm.description);
            formData.append("subject", uploadForm.subject);
            formData.append("semester", uploadForm.semester);
            formData.append("category", uploadForm.category);

            const res = await API.post("/resources", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                setActionMsg({ type: "success", text: "Study resource uploaded successfully!" });
                setShowUploadModal(false);
                setSelectedFile(null);
                setUploadForm({
                    title: "",
                    description: "",
                    subject: "",
                    semester: 6,
                    category: "Notes"
                });
                fetchResources();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to upload file.");
        } finally {
            setUploadLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px"
            }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>
                        Academic Resources & Study Material
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        Browse {totalResources} lecture notes, previous year question papers (PYQs), and lab manuals
                    </p>
                </div>

                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
                        <Upload size={18} /> Upload Academic Resource
                    </button>
                )}
            </div>

            {/* Action Feedback */}
            {actionMsg.text && (
                <div className={`alert alert-${actionMsg.type}`} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{actionMsg.text}</span>
                    <button onClick={() => setActionMsg({ type: "", text: "" })}>×</button>
                </div>
            )}

            {/* Filter Bar */}
            <div className="card" style={{ padding: "16px 20px", marginBottom: "28px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} style={{ flex: "1 1 260px", display: "flex", gap: "8px" }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title, subject, keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="btn btn-secondary">
                            <Search size={16} /> Search
                        </button>
                    </form>

                    {/* Semester Filter (1 to 8) */}
                    <div style={{ flex: "0 1 150px" }}>
                        <select
                            className="form-control"
                            value={semester}
                            onChange={(e) => { setSemester(e.target.value); setPage(1); }}
                        >
                            <option value="All">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div style={{ flex: "0 1 180px" }}>
                        <select
                            className="form-control"
                            value={category}
                            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Resources List / Table */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    Loading academic resources...
                </div>
            ) : resources.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
                    <BookOpen size={42} color="var(--text-muted)" style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
                    <h3 style={{ fontSize: "18px", fontWeight: "600" }}>No resources found</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                        Try selecting a different semester or category filter.
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {resources.map((item) => (
                        <div key={item._id} className="card card-hover" style={{ padding: "18px 22px" }}>
                            <div style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "16px"
                            }}>
                                {/* File icon and details */}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: "1 1 400px" }}>
                                    <div style={{
                                        background: item.fileType === "pdf" ? "#fee2e2" : "#dbeafe",
                                        color: item.fileType === "pdf" ? "#b91c1c" : "#1d4ed8",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "800",
                                        fontSize: "12px",
                                        textTransform: "uppercase"
                                    }}>
                                        {item.fileType || "DOC"}
                                    </div>

                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                                            <span className="badge badge-purple">Semester {item.semester}</span>
                                            <span className="badge badge-blue">{item.subject}</span>
                                            <span className="badge badge-gray">{item.category}</span>
                                        </div>

                                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                                            {item.title}
                                        </h3>

                                        {item.description && (
                                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                                                {item.description}
                                            </p>
                                        )}

                                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                                            Uploaded by {item.uploadedBy?.name || "Faculty"} • {(item.fileSize / 1024).toFixed(1)} KB • {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Download and Admin Delete */}
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleDownload(item._id, item.fileName)}
                                    >
                                        <Download size={15} /> Download File
                                    </button>

                                    {isAdmin && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteResource(item._id)}
                                            title="Delete File"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls (> 10 items) */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
            />

            {/* Upload Resource Modal for Admin */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                            Upload Academic Material
                        </h2>

                        <form onSubmit={handleUploadSubmit}>
                            <div className="form-group">
                                <label className="form-label">Material Title *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    placeholder="e.g. Operating Systems Unit 3 Lecture Notes"
                                    value={uploadForm.title}
                                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div className="form-group">
                                    <label className="form-label">Subject *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        placeholder="e.g. Operating Systems"
                                        value={uploadForm.subject}
                                        onChange={(e) => setUploadForm({ ...uploadForm, subject: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Semester * (1 - 8)</label>
                                    <select
                                        className="form-control"
                                        value={uploadForm.semester}
                                        onChange={(e) => setUploadForm({ ...uploadForm, semester: Number(e.target.value) })}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                                            <option key={s} value={s}>Semester {s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    className="form-control"
                                    value={uploadForm.category}
                                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                                >
                                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Brief Description (Optional)</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    placeholder="Topics covered, exam tips, unit numbers..."
                                    value={uploadForm.description}
                                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select File (PDF, DOCX, DOC, PPT, TXT) *</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    required
                                    accept=".pdf,.docx,.doc,.ppt,.pptx,.txt"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={uploadLoading}>
                                    {uploadLoading ? "Uploading File..." : "Upload Resource"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcesPage;
