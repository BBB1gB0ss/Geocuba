import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiUser, FiLock, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

const Login = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError(null);
    const result = await login(data.email, data.password);

    if (!result.success) {
      setError(
        result.message || "Error de autenticación. Verifique sus credenciales."
      );
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h1>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.email ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="ejemplo@geodesa.com"
              {...register("email", {
                required: "El correo electrónico es requerido",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Dirección de correo inválida",
                },
              })}
            />
            {errors.email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              className={`block w-full pl-10 pr-3 py-2 border ${
                errors.password ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="••••••••"
              {...register("password", {
                required: "La contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              })}
            />
            {errors.password && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={isLoading}
          >
            Iniciar Sesión
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Login;
