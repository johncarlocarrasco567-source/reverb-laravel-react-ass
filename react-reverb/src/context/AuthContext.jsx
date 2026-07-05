import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('/api/user')
                .then(({ data }) => setUser(data))
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/api/login', { email, password });
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setUser(data.user);
        return data;
    };

   const register = async (name, email, password, password_confirmation) => {
  try {
    const { data } = await axios.post('/api/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    localStorage.setItem('token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data;
  } catch (error) {
    // error.response.data contains validation messages
    throw error;
  }
};

   const logout = async () => {
  try {
    await axios.post('/api/logout');
  } catch (error) {
    // Ignore errors – the token is probably invalid anyway
  } finally {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }
};

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);