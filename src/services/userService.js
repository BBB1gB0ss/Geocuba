import api from './api'

// Get all users with pagination
export const getUsers = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  })
  
  const response = await api.get(`/users?${params}`)
  return response.data
}

// Get user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`)
  return response.data
}

// Update user
export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData)
  return response.data
}

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`)
  return response.data
}

// Change user role
export const changeUserRole = async (id, role) => {
  const response = await api.patch(`/users/${id}/role`, { role })
  return response.data
}