/**
 * API Mock para GEODESA
 * 
 * Este archivo simula respuestas de una API REST para la aplicación GEODESA.
 * Para una implementación real, estas funciones deberían ser reemplazadas por
 * llamadas reales a un servidor backend.
 */

// Base URL para la API (en un entorno real)
const API_BASE_URL = 'https://api.geodesa.com/v1';

// Tokens simulados
const TOKENS = {
  'admin@geodesa.com': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJlbWFpbCI6ImFkbWluQGdlb2Rlc2EuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjc2NTU2ODAwfQ.8rTg5JnFiYW3EJ0CelwgN38WsD3aPLM4LxvV9Evc6Fs',
    user: {
      id: 1,
      name: 'Administrador',
      email: 'admin@geodesa.com',
      role: 'admin'
    }
  },
  'especialista@geodesa.com': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwibmFtZSI6IkVzcGVjaWFsaXN0YSIsImVtYWlsIjoiZXNwZWNpYWxpc3RhQGdlb2Rlc2EuY29tIiwicm9sZSI6InNwZWNpYWxpc3QiLCJleHAiOjE2NzY1NTY4MDB9.L6-J7NQ9zV8HZ2M9JEyGGF8JnxRnUJKqLZcXDfXcpQ8',
    user: {
      id: 2,
      name: 'Especialista',
      email: 'especialista@geodesa.com',
      role: 'specialist'
    }
  },
  'usuario@geodesa.com': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwibmFtZSI6IlVzdWFyaW8gR2VuZXJhbCIsImVtYWlsIjoidXN1YXJpb0BnZW9kZXNhLmNvbSIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNjc2NTU2ODAwfQ.7dY1v9hpNcLH7KmR5ZKJYsTsHXa8DYpzC8Z8W4JxPDk',
    user: {
      id: 3,
      name: 'Usuario General',
      email: 'usuario@geodesa.com',
      role: 'user'
    }
  }
};

/**
 * Simulación de endpoints
 */

// 1. Autenticación
const AUTH_ENDPOINTS = {
  // POST /auth/login - Iniciar sesión
  login: async (email, password) => {
    // Simulación de validación
    if (!email || !password) {
      throw new Error('Credenciales incompletas');
    }
    
    // Verificar credenciales en la simulación
    const tokenData = TOKENS[email];
    if (!tokenData) {
      throw new Error('Credenciales inválidas');
    }
    
    // Devolver token y datos de usuario
    return {
      token: tokenData.token,
      user: tokenData.user
    };
  },
  
  // POST /auth/register - Registrar nuevo usuario (solo admin)
  register: async (userData) => {
    // Validación simulada
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
      throw new Error('Datos de usuario incompletos');
    }
    
    // Simulación de registro
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active'
    };
  },
  
  // POST /auth/logout - Cerrar sesión
  logout: async () => {
    return { message: 'Sesión cerrada con éxito' };
  }
};

// 2. Capas Geográficas
const LAYER_ENDPOINTS = {
  // GET /layers - Listar capas
  getLayers: async (page = 1, limit = 10, filters = {}) => {
    // Simulación de listado con paginación
    const totalCount = 24;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      data: [
        {
          id: 1,
          name: 'Mapa de Relieve Nacional',
          description: 'Representación del relieve topográfico con detalle de elevaciones.',
          thumbnail: 'https://example.com/thumbnails/relieve.jpg',
          date: '2023-11-15',
          user: 'Carlos Mendoza',
          userId: 1,
          keywords: ['relieve', 'topografía', 'elevación'],
          format: 'GeoTIFF'
        },
        // Simularía más elementos aquí
      ],
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit
      }
    };
  },
  
  // GET /layers/:id - Obtener detalles de una capa
  getLayerById: async (id) => {
    return {
      id,
      name: 'Mapa de Relieve Nacional',
      description: 'Representación detallada del relieve topográfico...',
      thumbnail: 'https://example.com/thumbnails/relieve.jpg',
      date: '2023-11-15',
      user: 'Carlos Mendoza',
      userId: 1,
      keywords: ['relieve', 'topografía', 'elevación'],
      format: 'GeoTIFF',
      fileSize: '245 MB',
      resolution: '10m',
      projection: 'UTM Zone 18S',
      metadata: {
        source: 'Instituto Geográfico Nacional',
        dataCaptureDate: '2023-05-10',
        processingLevel: 'Nivel 2',
        qualityControl: 'Validado',
        accuracy: '98.5%'
      }
    };
  },
  
  // POST /layers - Subir nueva capa
  uploadLayer: async (formData) => {
    // Validación simulada
    if (!formData.get('name') || !formData.get('file')) {
      throw new Error('Datos incompletos para la capa');
    }
    
    // Simulación de carga
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      name: formData.get('name'),
      message: 'Capa subida con éxito'
    };
  },
  
  // PUT /layers/:id - Actualizar información de capa
  updateLayer: async (id, data) => {
    return {
      id,
      ...data,
      message: 'Capa actualizada con éxito'
    };
  },
  
  // DELETE /layers/:id - Eliminar capa
  deleteLayer: async (id) => {
    return { message: 'Capa eliminada con éxito' };
  },
  
  // POST /layers/:id/comments - Añadir comentario a capa
  addComment: async (layerId, commentData) => {
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      layerId,
      content: commentData.content,
      user: 'Usuario Actual',
      userId: 3,
      role: 'specialist',
      date: new Date().toISOString()
    };
  },
  
  // GET /layers/:id/comments - Obtener comentarios de capa
  getLayerComments: async (layerId) => {
    return [
      {
        id: 1,
        layerId,
        content: 'La precisión de los datos de elevación es excelente.',
        user: 'Laura Martínez',
        userId: 2,
        role: 'specialist',
        date: '2023-11-14'
      },
      // Simularía más comentarios aquí
    ];
  }
};

// 3. Gestión de Usuarios
const USER_ENDPOINTS = {
  // GET /users - Listar usuarios
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    // Simulación de listado con paginación
    const totalCount = 12;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      data: [
        {
          id: 1,
          name: 'Carlos Mendoza',
          email: 'carlos@geodesa.com',
          role: 'admin',
          lastLogin: '2023-11-15T09:30:00Z',
          status: 'active'
        },
        // Simularía más usuarios aquí
      ],
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit
      }
    };
  },
  
  // GET /users/:id - Obtener detalles de usuario
  getUserById: async (id) => {
    return {
      id,
      name: 'Carlos Mendoza',
      email: 'carlos@geodesa.com',
      role: 'admin',
      lastLogin: '2023-11-15T09:30:00Z',
      status: 'active'
    };
  },
  
  // PUT /users/:id - Actualizar usuario
  updateUser: async (id, userData) => {
    return {
      id,
      ...userData,
      message: 'Usuario actualizado con éxito'
    };
  },
  
  // DELETE /users/:id - Eliminar usuario
  deleteUser: async (id) => {
    return { message: 'Usuario eliminado con éxito' };
  },
  
  // PATCH /users/:id/role - Cambiar rol de usuario
  changeUserRole: async (id, role) => {
    return { 
      id, 
      role,
      message: 'Rol de usuario actualizado con éxito' 
    };
  }
};

/**
 * Simulación de API completa
 */
export const API_DOCUMENTATION = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: {
        method: 'POST',
        path: '/auth/login',
        description: 'Iniciar sesión en el sistema',
        requestBody: {
          email: 'String',
          password: 'String'
        },
        responses: {
          200: {
            token: 'JWT token',
            user: 'Object with user data'
          },
          401: 'Unauthorized - Invalid credentials'
        }
      },
      register: {
        method: 'POST',
        path: '/auth/register',
        description: 'Registrar nuevo usuario (solo admin)',
        requestBody: {
          name: 'String',
          email: 'String',
          password: 'String',
          role: 'String (admin, specialist, user)'
        },
        responses: {
          201: 'Created user object',
          400: 'Bad request - Invalid data',
          403: 'Forbidden - No admin privileges'
        }
      },
      logout: {
        method: 'POST',
        path: '/auth/logout',
        description: 'Cerrar sesión',
        responses: {
          200: 'Success message',
          401: 'Unauthorized'
        }
      }
    },
    layers: {
      getLayers: {
        method: 'GET',
        path: '/layers',
        description: 'Listar capas con paginación y filtros',
        queryParams: {
          page: 'Number (default: 1)',
          limit: 'Number (default: 10)',
          search: 'String',
          dateFrom: 'Date (ISO format)',
          dateTo: 'Date (ISO format)',
          format: 'String',
          keywords: 'String (comma separated)'
        },
        responses: {
          200: 'List of layers with pagination',
          401: 'Unauthorized'
        }
      },
      getLayerById: {
        method: 'GET',
        path: '/layers/:id',
        description: 'Obtener detalles de una capa',
        responses: {
          200: 'Layer details',
          404: 'Not found',
          401: 'Unauthorized'
        }
      },
      uploadLayer: {
        method: 'POST',
        path: '/layers',
        description: 'Subir nueva capa (multipart/form-data)',
        requestBody: {
          name: 'String',
          description: 'String',
          date: 'Date (ISO format)',
          keywords: 'Array of strings',
          format: 'String',
          file: 'File'
        },
        responses: {
          201: 'Created layer object',
          400: 'Bad request - Invalid data',
          401: 'Unauthorized',
          403: 'Forbidden - No admin/specialist privileges'
        }
      },
      // Y así con el resto de endpoints
    },
    users: {
      // Documentación similar para endpoints de usuarios
    }
  }
};

export default {
  auth: AUTH_ENDPOINTS,
  layers: LAYER_ENDPOINTS,
  users: USER_ENDPOINTS,
  documentation: API_DOCUMENTATION
};