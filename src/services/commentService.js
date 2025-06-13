import api from "./api"; // Asegúrate de tener este archivo configurado para Axios

// Obtener todos los comentarios
export const getComments = async () => {
  const response = await api.get("/comments");
  return response.data;
};

export const addComment = async (layerId, commentData) => {
  // Cambia la URL para que apunte a /api/comments
  const response = await api.post(`/comments`, {
    ...commentData,
    layer_id: layerId,
  });
  return response.data;
};
