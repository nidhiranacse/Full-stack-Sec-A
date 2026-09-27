import React from "react";
import { GraduationCap, Heart, Code2 } from "lucide-react";

const Footer = () => {
    return (
        <footer style={{
            background: "#ffffff",
            borderTop: "1px solid var(--border)",
            padding: "32px 16px",
            marginTop: "auto"
        }}>
            <div style={{
                maxWidth: "1240px",
                margin: "0 auto",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        padding: "6px",
                        borderRadius: "8px"
                    }}>
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>
                            CampusConnect
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            Student Event & Academic Resource Management Portal
                        </div>
                    </div>
                </div>

                <div style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                }}>
                    <span>Full Stack Development Lab</span>
                    <span>•</span>
                    <span>B.Tech CSE</span>
                    <span>•</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Code2 size={15} /> MERN Stack
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
