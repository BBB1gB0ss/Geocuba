import api from "./api"; // Asegúrate de tener este archivo configurado para Axios

// Obtener todos los comentarios
export const getComments = async () => {
  const response = await api.get("/comments");
  return response.data;
};
