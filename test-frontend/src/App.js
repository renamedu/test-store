import React, { useState, useEffect, useRef } from "react";
function App() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("auth_token"));
    const API_BASE = "http://localhost:8876/api";
    const [savedAddresses, setSavedAddresses] = useState([]);
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    localStorage.removeItem("auth_token");
                    setToken(null);
                }
            } catch (err) {
                console.error("Ошибка загрузки профиля:", err);
            }
        };
        fetchProfile();
    }, [token]);
    useEffect(() => {
        if (!user?.id) return;
        const fetchSavedAddresses = async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/users/${user.id}/addresses`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await res.json();
                setSavedAddresses(data);
            } catch (err) {
                console.error("Ошибка загрузки адресов:", err);
            }
        };
        fetchSavedAddresses();
    }, [user]);
    const handleAuth = async (e) => {
        e.preventDefault();
        setErrors({});
        const url = isRegistering
            ? `${API_BASE}/register`
            : `${API_BASE}/login`;
        const body = isRegistering
            ? JSON.stringify({ name, email, password })
            : JSON.stringify({ email, password });
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem("auth_token", data.token);
                setToken(data.token);
                setUser(data.user || {});
            } else {
                setErrors(
                    data.errors || {
                        message: data.message || "Ошибка авторизации",
                    }
                );
            }
        } catch (err) {
            setErrors({ message: "Ошибка сети" });
        }
    };
    const handleLogout = async () => {
        if (!token) return;
        try {
            await fetch(`${API_BASE}/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.error("Ошибка при выходе:", err);
        } finally {
            localStorage.removeItem("auth_token");
            setToken(null);
            setUser(null);
        }
    };

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const searchTimeout = useRef(null);

    const handleQueryChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            if (value.length < 3) {
                setSuggestions([]);
                return;
            }
            fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": "Token c9c67add56780dec0b26637feb9790bc69eaf8a6"
                },
                body: JSON.stringify({ query: value })
            })
            .then(res => res.json())
            .then(data => setSuggestions(data.suggestions || []))
            .catch(err => console.error("Ошибка DaData:", err));
        }, 1000);
    };
    const handleSaveAddress = async (addressValue) => {
        if (!user || !token) return;
        try {
            const res = await fetch(`${API_BASE}/users/${user.id}/addresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ address: addressValue })
            });
            if (res.ok) {
                const saved = await res.json();
                setSavedAddresses(prev => [...prev, saved]);
            }
        } catch (err) {
            console.error("Ошибка сохранения адреса:", err);
        }
    };

    if (user) {
        return (
            <div>
                <h2>Привет! Вы вошли.</h2>
                <button onClick={handleLogout}>Выйти</button>
                <div>
                    <h2>Сохранённые адреса:</h2>
                    <ul>
                        {savedAddresses.map((addr, i) => (
                            <li key={i}>{addr.address}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2>Добавить новый адрес:</h2>
                    <input
                        type="text"
                        value={query}
                        onChange={handleQueryChange}
                        placeholder="Введите адрес"
                    />
                    <ul>
                        {suggestions.map((s, i) => (
                            <li key={i}>
                                {s.value}{" "}
                                <button onClick={() => handleSaveAddress(s.value)}>
                                    Сохранить
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2>{isRegistering ? "Регистрация" : "Вход"}</h2>

            {errors.message && <p>{errors.message}</p>}
            {errors.email?.[0] && <p>Email: {errors.email[0]}</p>}
            {errors.password?.[0] && <p>Пароль: {errors.password[0]}</p>}
            {errors.name?.[0] && <p>Имя: {errors.name[0]}</p>}

            <form onSubmit={handleAuth}>
                {isRegistering && (
                    <div>
                        <label>
                            Имя:
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                )}
                <div>
                    <label>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Пароль:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <button type="submit">
                    {isRegistering ? "Зарегистрироваться" : "Войти"}
                </button>
            </form>
            <p>
                {isRegistering ? "Уже есть аккаунт? " : "Нет аккаунта? "}
                <button onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? "Войти" : "Зарегистрироваться"}
                </button>
            </p>
        </div>
    );
}
export default App;
