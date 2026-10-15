import { useEffect, useState } from "react";
import API from "../services/api";

function Resources() {
    const [resources, setResources] = useState([]);

    const [search, setSearch] = useState("");
    const [subject, setSubject] = useState("");
    const [semester, setSemester] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchResources = async () => {
        try {
            setLoading(true);

            const response = await API.get(
                "/resources",
                {
                    params: {
                        search,
                        subject,
                        semester
                    }
                }
            );

            setResources(
                response.data.resources
            );

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load resources"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [search, subject, semester]);

    const downloadResource = async (id, fileName) => {
        try {
            const response = await API.get(
                `/resources/${id}/download`,
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link =
                document.createElement("a");

            link.href = url;
            link.download = fileName;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            alert("Download failed");
        }
    };

    return (
        <div className="page-container">

            <h1>Study Resources 📚</h1>

            <div className="filters">

                <input
                    type="text"
                    placeholder="Search resources..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) =>
                        setSubject(e.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Semester"
                    value={semester}
                    onChange={(e) =>
                        setSemester(e.target.value)
                    }
                />

            </div>

            {loading && (
                <p>Loading resources...</p>
            )}

            {error && (
                <p className="error">
                    {error}
                </p>
            )}

            <div className="card-grid">

                {resources.map((resource) => (

                    <div
                        className="event-card"
                        key={resource._id}
                    >

                        <span className="category">
                            {resource.category}
                        </span>

                        <h2>
                            {resource.title}
                        </h2>

                        <p>
                            {resource.description}
                        </p>

                        <p>
                            📖 Subject:
                            {" "}
                            {resource.subject}
                        </p>

                        <p>
                            🎓 Semester:
                            {" "}
                            {resource.semester}
                        </p>

                        <p>
                            📄 {resource.fileName}
                        </p>

                        <button
                            className="primary-btn"
                            onClick={() =>
                                downloadResource(
                                    resource._id,
                                    resource.fileName
                                )
                            }
                        >
                            Download
                        </button>

                    </div>

                ))}

            </div>

            {!loading &&
                resources.length === 0 && (
                    <div className="empty-state">
                        <h3>
                            No resources found
                        </h3>

                        <p>
                            Try changing your search
                            or filters.
                        </p>
                    </div>
                )}

        </div>
    );
}

export default Resources;