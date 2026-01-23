import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext();

// Decodifica JWT para obtener payload (sin verificar firma)
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// Verifica si el token ha expirado
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const loadAuth = () => {
      try {
        const stored = localStorage.getItem("auth");
        if (stored) {
          const { user: storedUser, token: storedToken } = JSON.parse(stored);

          if (storedToken && !isTokenExpired(storedToken)) {
            setUser(storedUser);
            setToken(storedToken);
          } else if (storedUser) {
            // Token expirado pero mantenemos datos del usuario
            setUser(storedUser);
            setToken(null);
          }
        }
      } catch (error) {
        console.error("Error loading auth from localStorage:", error);
        localStorage.removeItem("auth");
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    if (user || token) {
      localStorage.setItem("auth", JSON.stringify({ user, token }));
    }
  }, [user, token]);

  // Quick register - registro rápido con nombre y teléfono
  const quickRegister = useCallback(async (name, phone, address = null) => {
    try {
      const body = { name, phone };
      if (address) {
        body.address = address;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/quick-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.user);
        setToken(result.token);

        // También guardar en formato antiguo para compatibilidad
        localStorage.setItem('userData', JSON.stringify({
          id: result.user._id,
          name: result.user.name,
          phone: result.user.phone
        }));

        return { success: true, user: result.user, isNewUser: result.isNewUser };
      } else {
        throw new Error(result.message || 'Error en registro');
      }
    } catch (error) {
      console.error("Error en quickRegister:", error);
      return { success: false, error: error.message };
    }
  }, []);

  // Logout - limpia estado y localStorage
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("userData");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("userAddress");
    localStorage.removeItem("userAddresses");
  }, []);

  // Verificar si está autenticado (tiene token válido)
  const isAuthenticated = token !== null && !isTokenExpired(token);

  // Actualizar datos del usuario
  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    quickRegister,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
