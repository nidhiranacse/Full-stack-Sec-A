import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "32px",
            marginBottom: "16px"
        }}>
            <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
            >
                <ChevronLeft size={16} /> Prev
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: currentPage === p ? "var(--primary)" : "#ffffff",
                        color: currentPage === p ? "#ffffff" : "var(--text-main)",
                        border: currentPage === p ? "none" : "1px solid var(--border)"
                    }}
                >
                    {p}
                </button>
            ))}

            <button
                className="btn btn-secondary btn-sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
            >
                Next <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default Pagination;
