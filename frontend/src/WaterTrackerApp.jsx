import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function LoginPage({ setToken }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
            const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            navigate("/drink");
        } catch {
            setMessage("❌ Invalid credentials.");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "6rem auto 0", textAlign: "center" }}>
            <h2>Login</h2>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button onClick={login}>Login</button>
            </div>
            <p>
                Don’t have an account? <Link to="/register">Register here</Link>
            </p>
            {message && <p>{message}</p>}
        </div>
    );
}

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const register = async () => {
        try {
            await axios.post("http://localhost:3000/api/auth/register", { email, password });
            setMessage("✅ Registration successful. You can now log in.");
            setTimeout(() => navigate("/"), 1500);
        } catch {
            setMessage("❌ Registration failed.");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "6rem auto 0", textAlign: "center" }}>
            <h2>Register</h2>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button onClick={register}>Register</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
}

function DrinkPage({ token }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [subtypes, setSubtypes] = useState([]);
    const [selectedSubtype, setSelectedSubtype] = useState("");
    const [quantity, setQuantity] = useState("");
    const [message, setMessage] = useState("");
    const [totalToday, setTotalToday] = useState(0);

    const fetchToday = async () => {
        const res = await axios.get("http://localhost:3000/api/consumptions", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const today = new Date().toISOString().split("T")[0];
        const total = res.data
            .filter(log => new Date(log.date).toISOString().split("T")[0] === today)
            .reduce((sum, log) => sum + log.quantity, 0);
        setTotalToday(total);
    };

    useEffect(() => {
        axios.get("http://localhost:3000/api/drinks/options").then(res => {
            setCategories(res.data.categories);
        });
        fetchToday();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            axios.get(`http://localhost:3000/api/drinks/options?category=${encodeURIComponent(selectedCategory)}`)
                .then(res => setSubtypes(res.data.options));
        }
    }, [selectedCategory]);

    const submit = async () => {
        const parsed = parseFloat(quantity);
        if (isNaN(parsed) || parsed <= 0) {
            setMessage("❌ Please enter a valid quantity in liters (number > 0)");
            return;
        }

        await axios.post("http://localhost:3000/api/consumptions", {
            drinkId: 1,
            quantity: parsed * 1000,
            date: new Date().toISOString().split("T")[0]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMessage("✅ Drink logged!");
        setQuantity("");
        await fetchToday();
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "6rem auto 0", textAlign: "center" }}>
            <h2>Register a Drink</h2>
            <select onChange={e => setSelectedCategory(e.target.value)} value={selectedCategory}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {subtypes.length > 0 && (
                <select onChange={e => setSelectedSubtype(e.target.value)} value={selectedSubtype}>
                    <option value="">Select Type</option>
                    {subtypes.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
            )}
            <input placeholder="Quantity (L)" value={quantity} onChange={e => setQuantity(e.target.value)} />
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button onClick={submit}>Submit</button>
            </div>
            <p>{message}</p>
            <p><strong>Total today:</strong> {(totalToday / 1000).toFixed(2)} L</p>
        </div>
    );
}

function LogsPage({ token }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3000/api/consumptions", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const today = new Date();
            const last30 = new Date();
            last30.setDate(today.getDate() - 29);
            const map = new Map();

            for (let i = 0; i < 30; i++) {
                const d = new Date(last30);
                d.setDate(last30.getDate() + i);
                const key = d.toISOString().split('T')[0];
                map.set(key, 0);
            }

            res.data.forEach(log => {
                const key = new Date(log.date).toISOString().split('T')[0];
                if (map.has(key)) {
                    map.set(key, map.get(key) + log.quantity / 1000);
                }
            });

            const chartData = Array.from(map.entries()).map(([date, value]) => ({ date, value }));
            setData(chartData);
        });
    }, [token]);

    return (
        <div style={{ marginTop: '6rem', textAlign: 'center' }}>
            <h2>Drink Logs (Last 30 Days)</h2>
            {data.length === 0 ? (
                <p>No data available.</p>
            ) : (
                <ResponsiveContainer width="95%" height={300}>
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Liters', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#007BFF" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
function ThresholdPage({ token }) {
    const [thresholds, setThresholds] = useState([]);
    const [limit, setLimit] = useState("");

    const fetchThresholds = async () => {
        const res = await axios.get("http://localhost:3000/api/thresholds", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setThresholds(res.data);
    };

    useEffect(() => {
        fetchThresholds();
    }, [token]);

    const addThreshold = async () => {
        await axios.post("http://localhost:3000/api/thresholds", {
            daily_limit: parseFloat(limit) * 1000,
            drinkId: 1
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setLimit("");
        fetchThresholds();
    };

    const deleteThreshold = async (id) => {
        await axios.delete(`http://localhost:3000/api/thresholds/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchThresholds();
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "600px", margin: "6rem auto 0", textAlign: "center" }}>
            <h2>Threshold Settings</h2>
            <input placeholder="Daily limit (L)" value={limit} onChange={e => setLimit(e.target.value)} />
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <button onClick={addThreshold}>Add / Update</button>
            </div>
            <ul>
                {thresholds.map(t => (
                    <li key={t.id}>
                        {(t.daily_limit / 1000).toFixed(2)} L (Drink ID: {t.DrinkId})
                        <div style={{ textAlign: "center", marginTop: "1rem" }}>
                            <button onClick={() => deleteThreshold(t.id)} style={{ marginLeft: "1rem" }}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <Router>
            <nav style={{ padding: "1rem", background: "#007BFF", color: "white", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                {token ? (
                    <>
                        <Link to="/drink" style={{ marginRight: "1rem", color: "white" }}>Drink</Link>
                        <Link to="/logs" style={{ marginRight: "1rem", color: "white" }}>Logs</Link>
                        <Link to="/thresholds" style={{ marginRight: "1rem", color: "white" }}>Thresholds</Link>
                        <button onClick={logout} style={{ background: "white", color: "#007BFF", border: "none", padding: "0.5rem" }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/" style={{ marginRight: "1rem", color: "white" }}>Login</Link>
                        <Link to="/register" style={{ color: "white" }}>Register</Link>
                    </>
                )}
            </nav>
            <Routes>
                <Route path="/" element={<LoginPage setToken={setToken} />} />
                <Route path="/register" element={<RegisterPage />} />
                {token ? (
                    <>
                        <Route path="/drink" element={<DrinkPage token={token} />} />
                        <Route path="/logs" element={<LogsPage token={token} />} />
                        <Route path="/thresholds" element={<ThresholdPage token={token} />} />
                        <Route path="*" element={<Navigate to="/drink" />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/" />} />
                )}
            </Routes>
        </Router>
    );
}
