import api from "./api";

export const createLayer = async (layerData) => {
  const response = await api.post("/layers", layerData);
  return response.data;
};
// Get all layers with pagination
export const getLayers = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters,
  });

  const response = await api.get(`/layers?${params}`);
  return response.data;
};

// Get layer by ID
export const getLayerById = async (id) => {
  const response = await api.get(`/layers/${id}`);
  return response.data;
};

// Upload new layer
export const uploadLayer = async (formData) => {
  const response = await api.post("/layers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update layer information
export const updateLayer = async (id, data) => {
  const response = await api.put(`/layers/${id}`, data);
  return response.data;
};

// Delete layer
export const deleteLayer = async (id) => {
  const response = await api.delete(`/layers/${id}`);
  return response.data;
};

// Add comment to layer
export const addComment = async (layerId, commentData) => {
  // Cambia la URL para que apunte a /comments, no a /layers/:id/comments
  const response = await api.post(`/comments`, {
    ...commentData,
    layer_id: layerId,
  });
  return response.data;
};
// Get layer comments
export const getLayerComments = async (layerId) => {
  // Cambia la ruta aquí para que coincida con tu backend
  const response = await api.get(`/comments/layers/${layerId}/comments`);
  return response.data;
};

export const getAllLayers = async () => {
  const response = await api.get("/layers");
  return response.data;
};

export const deleteComment = async (commentId) => {
  return api.delete(`/comments/${commentId}`);
};
export const editComment = async (commentId, data) => {
  return api.put(`/comments/${commentId}`, data);
};
