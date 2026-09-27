import React, { useState, useEffect } from "react";
import API from "../services/api";
import { X, Users, Mail, GraduationCap, Calendar, Download } from "lucide-react";

const AttendeeModal = ({ eventId, eventTitle, onClose }) => {
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [stats, setStats] = useState({ totalSeats: 0, registeredCount: 0 });

    useEffect(() => {
        const fetchAttendees = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/events/${eventId}/attendees`);
                if (res.data.success) {
                    setAttendees(res.data.attendees || []);
                    setStats({
                        totalSeats: res.data.totalSeats,
                        registeredCount: res.data.registeredCount
                    });
                }
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load attendees.");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchAttendees();
        }
    }, [eventId]);

    // Export CSV feature
    const exportCSV = () => {
        if (!attendees.length) return;
        const headers = "Name,Email,Department,Semester,RegisteredAt\n";
        const rows = attendees.map((s) => `"${s.name}","${s.email}","${s.department || 'N/A'}","${s.semester || 'N/A'}","${new Date(s.createdAt).toLocaleDateString()}"`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}_attendees.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Users size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Registered Students</h2>
                        </div>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                            Event: <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{eventTitle}</span>
                        </p>
                    </div>
                    <button onClick={onClose} style={{ padding: "6px", color: "var(--text-muted)" }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Registration capacity pill */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 16px",
                    background: "var(--bg-main)",
                    borderRadius: "8px",
                    marginBottom: "16px"
                }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--secondary)" }}>
                        Registrations: {stats.registeredCount} / {stats.totalSeats} seats filled
                    </span>
                    {attendees.length > 0 && (
                        <button onClick={exportCSV} className="btn btn-secondary btn-sm" style={{ padding: "4px 10px" }}>
                            <Download size={14} /> Export CSV
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
                        Loading registered students list...
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : attendees.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                        <Users size={36} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
                        <p>No students have registered for this event yet.</p>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ maxHeight: "360px", overflowY: "auto" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Dept / Sem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendees.map((student, idx) => (
                                    <tr key={student._id || idx}>
                                        <td>{idx + 1}</td>
                                        <td style={{ fontWeight: "600" }}>{student.name}</td>
                                        <td style={{ color: "var(--text-muted)" }}>{student.email}</td>
                                        <td>
                                            {student.department ? `${student.department} (Sem ${student.semester || 'N/A'})` : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendeeModal;
