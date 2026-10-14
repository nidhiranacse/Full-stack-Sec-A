function App() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f4f7fb",
            fontFamily: "Arial, sans-serif"
        }}>
            <div style={{
                width: "400px",
                padding: "35px",
                background: "white",
                borderRadius: "15px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}>
                <h1>CampusConnect</h1>
                <p>Login to your account</p>

                <input
                    type="email"
                    placeholder="Email"
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "15px",
                        boxSizing: "border-box"
                    }}
                />

                <input
                    type="password"
                    placeholder="Password"
                    style={{
                        width: "100%",
                        padding: "12px",
                        marginBottom: "15px",
                        boxSizing: "border-box"
                    }}
                />

                <button
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                >
                    Login
                </button>
            </div>
        </div>
    );
}

export default App;