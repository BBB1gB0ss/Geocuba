import api from './api';
import mocks from '../mocks/api';

// Verifica si se habilitan los mocks
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

// Login user
export const loginUser = async (email, password) => {
  if (useMock) {
    // Utiliza el mock de login
    return await mocks.auth.login(email, password);
  } else {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

// Register new user (admin only)
export const registerUser = async (userData) => {
  if (useMock) {
    // Utiliza el mock de register
    return await mocks.auth.register(userData);
  } else {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

// Logout user
export const logoutUser = async () => {
  if (useMock) {
    // Utiliza el mock de logout
    return await mocks.auth.logout();
  } else {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  if (useMock) {
    // Si cuentas con un método mock para obtener el usuario actual, úsalo; de lo contrario, simula una respuesta
    if (mocks.auth.me) {
      return await mocks.auth.me();
    }
    // Retorno simulado (ajusta según lo que necesites)
    return Promise.resolve({
      user: {
        id: 1,
        name: 'Usuario Mock',
        email: 'mock@geodesa.com',
        role: 'admin'
      }
    });
  } else {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  if (useMock) {
    // Simula la actualización del perfil de usuario
    return Promise.resolve({
      id: userId,
      ...userData,
      message: 'Usuario actualizado (mock)'
    });
  } else {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
};