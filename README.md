# 🏦 Flutter Play - Mi Banca Universitaria

[![Version](https://img.shields.io/badge/version-2.6.0-blue.svg)](https://github.com/JosePablo1996/Flutter_Play_Web/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blueviolet)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-yellow)](https://vitejs.dev/)
[![Render](https://img.shields.io/badge/Render-Deployed-brightgreen)](https://flutter-play-web.onrender.com)

> **Aplicación web para gestión financiera estudiantil** con autenticación segura, presupuestos inteligentes y estadísticas en tiempo real.

![Flutter Play Dashboard](https://via.placeholder.com/1200x600/0D0D0D/00E676?text=Flutter+Play+Dashboard)

---

## 🚀 Demo en Vivo

🔗 **Frontend:** [https://flutter-play-web.onrender.com](https://flutter-play-web.onrender.com)  
🔗 **API:** [https://flutter-play-api.onrender.com](https://flutter-play-api.onrender.com)  
📚 **Documentación API:** [https://flutter-play-api.onrender.com/docs](https://flutter-play-api.onrender.com/docs)

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
| Característica | Descripción |
|----------------|-------------|
| **2FA (TOTP)** | Autenticación de dos factores con Google Authenticator, Authy o Microsoft Authenticator |
| **Passkeys** | Login biométrico con Windows Hello, Face ID o Touch ID (solo desarrollo) |
| **Login OTP** | Inicio de sesión sin contraseña mediante código de 6 dígitos por email |
| **JWT Tokens** | Autenticación segura con tokens JWT |
| **Historial de Accesos** | Registro completo de todos los inicios de sesión |
| **Sesiones Activas** | Gestión de dispositivos conectados con cierre remoto |
| **Cambios de Seguridad** | Auditoría de cambios de contraseña y configuración 2FA |

### 💰 Gestión Financiera
| Característica | Descripción |
|----------------|-------------|
| **Gastos** | CRUD completo con categorías personalizables |
| **Presupuestos** | Presupuestos mensuales por categoría con alertas al 70% y 100% |
| **Gastos Recurrentes** | Automatización de gastos diarios, semanales, mensuales o anuales |
| **Categorías** | 8 categorías predefinidas + categorías personalizadas con iconos y colores |

### 📊 Dashboard y Estadísticas
| Característica | Descripción |
|----------------|-------------|
| **Gráficos Interactivos** | Barras, pastel y área con filtros por fecha/categoría |
| **Calendario de Gastos** | Visualización de gastos por día con montos en el calendario |
| **Exportación de Datos** | Exportar gastos a CSV o JSON para respaldo |
| **Alertas de Presupuesto** | Notificaciones visuales al 70% y 100% del presupuesto |

### 🎨 Diseño y Experiencia
| Característica | Descripción |
|----------------|-------------|
| **12 Temas de Color** | Neon, Azul, Púrpura, Verde, Rojo, Naranja, Rosa, Cian, Amarillo, Teal, Índigo, Marrón |
| **Modo Oscuro/Claro** | Cambio automático con persistencia en localStorage |
| **Glassmorphism** | Efectos de vidrio y backdrop-blur en toda la interfaz |
| **Diseño Responsive** | Adaptación a móvil, tablet y desktop |

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| [React](https://reactjs.org/) | 18.2.0 | Framework UI con Hooks y Concurrent Features |
| [TypeScript](https://www.typescriptlang.org/) | 5.0.0 | Tipado estático y seguridad en tiempo de compilación |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.0 | Utilidades CSS para diseño rápido y personalizable |
| [Framer Motion](https://www.framer.com/motion/) | 10.16.0 | Animaciones fluidas y transiciones |
| [Vite](https://vitejs.dev/) | 5.0.0 | Build tool ultrarrápida con HMR |
| [React Router](https://reactrouter.com/) | 6.20.0 | Enrutamiento dinámico y rutas protegidas |
| [Axios](https://axios-http.com/) | 1.6.0 | Cliente HTTP con interceptores |

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115.6 | API REST asíncrona con Python |
| [Supabase](https://supabase.com/) | 2.39.0 | Backend como servicio con PostgreSQL |
| [PostgreSQL](https://www.postgresql.org/) | 15.0 | Base de datos relacional con RLS |
| [WebAuthn](https://webauthn.guide/) | Level 3 | Autenticación biométrica (Passkeys) |
| [TOTP](https://github.com/pyotp/pyotp) | 2.9.0 | Autenticación de dos factores |

---

## 📦 Instalación Local

### Requisitos Previos
- Node.js 18+
- npm 9+
- Git

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/JosePablo1996/Flutter_Play_Web.git
cd Flutter_Play_Web

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env

# 4. Configurar variables de entorno (editar .env)
# VITE_API_URL=http://localhost:8000
# VITE_SUPABASE_URL=tu_url
# VITE_SUPABASE_ANON_KEY=tu_key

# 5. Ejecutar en desarrollo
npm run dev

# 6. Abrir en el navegador
# http://localhost:5173

Variables de Entorno

# API URL (Local o Producción)
VITE_API_URL=https://flutter-play-api.onrender.com

# Supabase
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Control de Features
VITE_ENVIRONMENT=production
VITE_FORCE_PASSKEY=false
VITE_FORCE_DEBUG=false

🚀 Despliegue
Render (Recomendado)

1. Conecta tu repositorio en Render

2. Configura el Static Site:

    . Build Command: npm install && npm run build

    . Publish Directory: dist

3. Agrega las variables de entorno

4. Haz clic en Deploy

Vercel

# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

Netlify

# Instalar Netlify CLI
npm install -g netlify-cli

# Desplegar
netlify deploy --prod

📁 Estructura del Proyecto

Flutter_Play_Web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Imágenes y recursos
│   ├── components/
│   │   ├── Budgets/         # Componentes de presupuestos
│   │   ├── Dashboard/       # Componentes del dashboard
│   │   ├── Layout/          # Layout y navegación
│   │   ├── Security/        # Componentes de seguridad
│   │   ├── Settings/        # Componentes de configuración
│   │   ├── Stats/           # Componentes de estadísticas
│   │   └── UI/              # Componentes UI reutilizables
│   ├── context/             # React Context (Auth, Theme, Notifications)
│   ├── hooks/               # Custom Hooks
│   ├── pages/
│   │   ├── auth/            # Páginas de autenticación
│   │   ├── Security/        # Páginas de seguridad
│   │   └── TwoFactorSetup/  # Configuración 2FA
│   ├── services/            # Servicios API
│   ├── types/               # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md

🔐 Seguridad
Características de Seguridad

    ✅ JWT Authentication con expiración de 7 días

    ✅ 2FA (TOTP) con Google Authenticator

    ✅ Passkeys (WebAuthn) para login biométrico

    ✅ Historial de Contraseñas (últimas 5, sin reutilización)

    ✅ Sesiones Activas con gestión remota

    ✅ Alertas por Email para cambios de seguridad

    ✅ RLS Policies en Supabase

    ✅ CORS configurado para producción

Recomendaciones de Seguridad

    1. Usa siempre 2FA en tu cuenta

    2. Cambia tu contraseña periódicamente

    3. Revisa tus sesiones activas regularmente

    4. No compartas tus credenciales

🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

    Haz un fork del proyecto

    Crea una rama para tu feature (git checkout -b feature/nueva-caracteristica)

    Commit tus cambios (git commit -m 'feat: agregar nueva característica')

    Push a la rama (git push origin feature/nueva-caracteristica)

    Abre un Pull Request

📄 Licencia

Este proyecto está bajo la licencia MIT.

MIT License

Copyright (c) 2026 José Pablo Miranda Quintanilla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

📞 Contacto

Medio	Enlace
GitHub	@JosePablo1996
Email	pabloboquintanilla988@gmail.com
API Docs	https://flutter-play-api.onrender.com/docs

🙏 Agradecimientos

    . React - Framework UI

    . FastAPI - API Framework

    . Supabase - Backend como servicio

    . Tailwind CSS - Framework CSS

    . Framer Motion - Animaciones

⭐ ¿Te gusta este proyecto?

¡Dale una estrella en GitHub! ⭐

https://img.shields.io/github/stars/JosePablo1996/Flutter_Play_Web.svg?style=social

Desarrollado con ❤️ por José Pablo Miranda Quintanilla

Tu banca universitaria, siempre contigo.


---

## 📋 Comandos para subir el README

```bash
# 1. Guardar el README en tu proyecto
# (copia el contenido en src/README.md)

# 2. Agregar y subir cambios
git add README.md
git commit -m "docs: agregar README completo para Flutter Play Web"
git push origin master