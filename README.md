# GEODESA - Plataforma de Gestión Geográfica

Plataforma web para gestión, visualización y colaboración en torno a capas de información geográfica.

## Características Principales

- **Autenticación y Control de Acceso**: Sistema completo con roles (administrador, especialista, usuario general)
- **Gestión de Capas Geográficas**: Subida, visualización, búsqueda y administración de capas
- **Sistema de Comentarios**: Permite comentarios técnicos y observaciones generales en las capas
- **Administración de Usuarios**: Panel para gestionar usuarios y sus roles
- **Diseño Responsivo**: Interfaz adaptable a dispositivos móviles y escritorio

## Tecnologías Utilizadas

- React.js + Vite
- Tailwind CSS
- React Router
- React Hook Form
- Axios
- Framer Motion (animaciones)

## Instalación

1. Clone el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/geodesa-plataforma.git
   cd geodesa-plataforma
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

3. Cree un archivo `.env` basado en `.env.example` y configure las variables de entorno:
   ```
   VITE_API_URL=https://api.geodesa.com/v1
   ```

4. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abra http://localhost:5173 en su navegador

## Estructura del Proyecto

```
src/
  ├── assets/          # Recursos estáticos (logos, imágenes)
  ├── components/      # Componentes reutilizables
  │   ├── layout/      # Componentes de estructura (Header, Sidebar, etc.)
  │   └── ui/          # Componentes de interfaz (Button, Modal, etc.)
  ├── context/         # Contextos de React (AuthContext)
  ├── pages/           # Páginas de la aplicación
  │   ├── Auth/        # Login, Register
  │   ├── Dashboard/   # Panel principal
  │   ├── Layers/      # Gestión de capas
  │   └── Users/       # Administración de usuarios
  ├── services/        # Servicios de API
  └── mocks/           # Simulación de API para desarrollo
```

## Usuarios de Prueba

Para probar la plataforma puede utilizar las siguientes credenciales:

- **Administrador**
  - Email: admin@geodesa.com
  - Contraseña: admin123

- **Especialista**
  - Email: especialista@geodesa.com
  - Contraseña: esp123

- **Usuario General**
  - Email: usuario@geodesa.com
  - Contraseña: user123

## Backend API (Simulada)

En el ambiente de desarrollo, la aplicación utiliza una API simulada para demostración. En producción, es necesario conectar a un backend real que implemente los endpoints documentados en `src/mocks/api.js`.

## Despliegue

Para compilar la aplicación para producción:

```bash
npm run build
```

Los archivos estáticos se generarán en el directorio `dist/`, listos para ser desplegados en cualquier servidor web estático.

## Licencia

Este proyecto está licenciado bajo [LICENCIA]. Consulte el archivo LICENSE para más detalles.