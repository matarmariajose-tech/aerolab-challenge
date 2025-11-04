# GameHub - Aerolab Coding Challenge

## 🚀 Live Demo
**[Production Demo](https://aerolab-challenge-m783p7wrl-maria-jose-s-projects-4d5aca07.vercel.app/)**

## 📋 Challenge Overview
Solución completa del Frontend Developer Coding Challenge de Aerolab, implementando un sistema de búsqueda y colección de videojuegos usando la API de IGDB.

## ✨ Características Principales

### 🔍 Búsqueda Avanzada
- Búsqueda en tiempo real con sugerencias tipo Google
- Manejo inteligente de rate limits de la API
- Optimización de requests con debouncing
- Resultados dinámicos con cover art y metadata

### 🎮 Gestión de Colección
- Sistema de colección personal persistente
- Ordenamiento por fecha de lanzamiento y fecha de agregado
- Estado vacío elegante con CTA
- Operaciones CRUD completas (agregar/remover)

### 🎨 Experiencia de Usuario
- **Design System** consistente siguiendo el Figma de Aerolab
- **100% Responsive** - mobile-first approach
- **Micro-interacciones** y transiciones fluidas
- **Loading states** y manejo de errores elegante
- **Accesibilidad** completa (ARIA labels, keyboard navigation)

### 📱 Páginas de Detalle
- Metadata completa: rating, plataformas, fecha de lanzamiento
- Galería de screenshots
- Juegos similares con navegación interna
- URLs SEO-friendly con slugs
- Open Graph metadata dinámica

## 🛠 Tech Stack & Arquitectura

### Core Technologies
- **Next.js 14** - App Router con Server Components
- **TypeScript** - Type safety completo
- **Tailwind CSS** - Styling utility-first
- **Zustand** - State management minimalista

### Performance & SEO
- **Image Optimization** - Next.js Image component
- **SSR/SSG** - Renderizado híbrido
- **Metadata API** - Open Graph dinámico
- **Web Vitals** - Optimizado para Core Web Vitals

### Development Excellence
- **Code Architecture** - Componentes reutilizables
- **Error Boundaries** - Manejo elegante de errores
- **Type Safety** - Interfaces completas para IGDB API
- **Environment Variables** - Configuración segura

## 🚀 Getting Started

```bash
# Instalación
git clone https://github.com/matarmariajose-tech/aerolab-challenge.git
cd aerolab-challenge
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build
npm start
```
