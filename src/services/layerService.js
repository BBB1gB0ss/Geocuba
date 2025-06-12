import api from './api'

// Get all layers with pagination
export const getLayers = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  })
  
  const response = await api.get(`/layers?${params}`)
  return response.data
}

// Get layer by ID
export const getLayerById = async (id) => {
  const response = await api.get(`/layers/${id}`)
  return response.data
}

// Upload new layer
export const uploadLayer = async (formData) => {
  const response = await api.post('/layers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// Update layer information
export const updateLayer = async (id, data) => {
  const response = await api.put(`/layers/${id}`, data)
  return response.data
}

// Delete layer
export const deleteLayer = async (id) => {
  const response = await api.delete(`/layers/${id}`)
  return response.data
}

// Add comment to layer
export const addComment = async (layerId, commentData) => {
  const response = await api.post(`/layers/${layerId}/comments`, commentData)
  return response.data
}

// Get layer comments
export const getLayerComments = async (layerId) => {
  const response = await api.get(`/layers/${layerId}/comments`)
  return response.data
}