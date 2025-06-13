import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiCheck,
} from "react-icons/fi";
import { motion } from "framer-motion";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Loading from "../../components/ui/Loading";
import {
  getUsers,
  updateUser,
  deleteUser,
  changeUserRole,
} from "../../services/userService";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  // Cargar usuarios reales
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data.users || data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAlert({
        type: "error",
        message: "Error al cargar los usuarios",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleEditRoleClick = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setEditRoleModalOpen(true);
  };

  // Eliminar usuario REAL
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      await deleteUser(selectedUser.id || selectedUser._id);
      setAlert({
        type: "success",
        message: `El usuario "${selectedUser.name}" ha sido eliminado correctamente.`,
      });
      // Recargar usuarios reales
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlert({
        type: "error",
        message: "Error al eliminar el usuario",
      });
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Cambiar rol REAL
  const confirmRoleChange = async () => {
    if (!selectedUser || selectedRole === selectedUser.role) return;

    try {
      setIsLoading(true);
      await changeUserRole(selectedUser.id || selectedUser._id, selectedRole);
      setAlert({
        type: "success",
        message: `El rol de "${selectedUser.name}" ha sido actualizado a "${
          selectedRole === "admin"
            ? "Administrador"
            : selectedRole === "specialist"
            ? "Especialista"
            : "Usuario General"
        }".`,
      });
      // Recargar usuarios reales
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      setAlert({
        type: "error",
        message: "Error al actualizar el rol del usuario",
      });
    } finally {
      setIsLoading(false);
      setEditRoleModalOpen(false);
      setSelectedUser(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios del sistema.
          </p>
        </div>

        <Button to="/register" variant="primary" icon={<FiUserPlus />}>
          Registrar Usuario
        </Button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="max-w-md">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Buscar Usuarios
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nombre, email o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rol
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Último Acceso
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id || user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-700 font-medium">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-primary-100 text-primary-800"
                            : user.role === "specialist"
                            ? "bg-secondary-100 text-secondary-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role === "admin"
                          ? "Administrador"
                          : user.role === "specialist"
                          ? "Especialista"
                          : "Usuario General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-secondary-600 hover:text-secondary-900 mr-3"
                        onClick={() => handleEditRoleClick(user)}
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="p-4">
          <p className="mb-4">
            ¿Está seguro que desea eliminar al usuario "{selectedUser?.name}"?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={isLoading}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={editRoleModalOpen}
        onClose={() => setEditRoleModalOpen(false)}
        title="Cambiar Rol de Usuario"
      >
        <div className="p-4">
          <p className="mb-4">
            Cambiar el rol de{" "}
            <span className="font-medium">{selectedUser?.name}</span>
          </p>

          <div className="space-y-4 mb-6">
            <div
              className={`border rounded-md p-3 cursor-pointer ${
                selectedRole === "admin"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedRole("admin")}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedRole === "admin"
                      ? "border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedRole === "admin" && (
                    <FiCheck className="w-3 h-3 text-primary-500" />
                  )}
                </div>
                <div className="ml-3">
                  <span className="font-medium">Administrador</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Acceso completo al sistema. Puede gestionar usuarios y todas las
                capas.
              </p>
            </div>

            <div
              className={`border rounded-md p-3 cursor-pointer ${
                selectedRole === "specialist"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedRole("specialist")}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedRole === "specialist"
                      ? "border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedRole === "specialist" && (
                    <FiCheck className="w-3 h-3 text-primary-500" />
                  )}
                </div>
                <div className="ml-3">
                  <span className="font-medium">Especialista</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Puede subir capas y emitir comentarios técnicos.
              </p>
            </div>

            <div
              className={`border rounded-md p-3 cursor-pointer ${
                selectedRole === "user"
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-300"
              }`}
              onClick={() => setSelectedRole("user")}
            >
              <div className="flex items-center">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedRole === "user"
                      ? "border-primary-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedRole === "user" && (
                    <FiCheck className="w-3 h-3 text-primary-500" />
                  )}
                </div>
                <div className="ml-3">
                  <span className="font-medium">Usuario General</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Solo puede ver capas y emitir observaciones generales.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setEditRoleModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={confirmRoleChange}
              loading={isLoading}
              disabled={selectedRole === selectedUser?.role}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersList;
