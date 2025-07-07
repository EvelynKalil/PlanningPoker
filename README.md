# Planning Poker – React Challenge

**Planning Poker** es una aplicación colaborativa construida con React, diseñada para facilitar sesiones de estimación ágiles utilizando la técnica de planning poker.  
Se desarrolló siguiendo buenas prácticas de frontend, el principio de diseño atómico y teniendo en cuenta la accesibilidad.

---

## Tabla de Contenidos

- [Demo en Vivo](#demo-en-vivo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías Usadas](#tecnologías-usadas)
- [Instalación](#instalación)
- [Uso](#uso)
- [Características](#características)
- [Configuración](#configuración)
- [Dependencias](#dependencias)
- [Contribuyentes](#contribuyentes)

---

## Demo en Vivo

**Próximamente…**

---

## Estructura del Proyecto

Organizado con el patrón de **Atomic Design**:

```
├── PlanningPoker/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── custom.d.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── assets/
│   │   │   ├── Logo.png
│   │   │   ├── LogoPragma.png
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   │   ├── Button/
│   │   │   │   ├── InputText/
│   │   │   │   ├── RadioButton/
│   │   │   │   ├── SelectInput/
│   │   │   │   ├── SpinnerCounting/
│   │   │   ├── molecules/
│   │   │   │   ├── FormCreateGame/
│   │   │   ├── organisms/
│   │   │   │   ├── GameTable/
│   │   │   │   ├── InviteModal/
│   │   │   │   ├── ModalPlayer/
│   │   │   │   ├── ModalUserSettings/
│   │   │   │   ├── VotingResults/
│   │   │   ├── templates/
│   │   │   │   ├── SplashScreen/
│   │   │   ├── pages/
│   │   │   │   ├── App.tsx
│   │   │   │   ├── SalaPage.tsx
│   ├── hooks/
│   │   ├── usePlayers.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── userSlice.ts
│   ├── tests/
│   │   ├── App.test.tsx
│   │   ├── Button.test.tsx
│   │   ├── FormCreateGame.test.tsx
│   │   ├── GameTable.test.tsx
│   │   ├── InputText.test.tsx
│   │   ├── InviteModal.test.tsx
│   │   ├── ModalPlayer.test.tsx
│   │   ├── ModalUserSettings.test.tsx
│   │   ├── RadioButton.test.tsx
│   │   │   ├── reorderCards.test.tsx
│   │   │   ├── SalaPage.test.tsx
│   │   │   ├── SelectInput.test.tsx
│   │   │   ├── session.test.ts
│   │   │   ├── setupTest.ts
│   │   │   ├── SpinnerCounting.test.tsx
│   │   │   ├── SplashScreen.test.tsx
│   │   │   ├── store.test.ts
│   │   │   ├── usePlayers.test.ts
│   │   │   ├── userSlice.test.ts
│   │   │   ├── VotingResults.test.tsx
│   │   ├── utils/
│   │   │   ├── cards.ts
│   │   │   ├── session.tsx


```

---

## Tecnologías Usadas

- **React** – Librería principal para construir la UI
- **React Router DOM** – Enrutamiento para SPAs
- **Redux Toolkit** – Manejo de estado global
- **React Redux** – Enlace entre Redux y React
- **@dnd-kit** – Utilidades para funcionalidades de arrastrar y soltar
- **Vite** – Bundler moderno para desarrollo rápido
- **TypeScript** – Tipado estático sobre JavaScript
- **CSS puro** – Estilización sin frameworks
- **ESLint** – Linter para mantener el código limpio
- **Vitest** – Framework de pruebas moderno y rápido
- **Jest** – Herramienta de pruebas
- **Testing Library** – Utilidades para pruebas accesibles (DOM, React, User Events)
- **jsdom** – Emulación del DOM para entornos de test

---

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/EvelynKalil/PlanningPoker
```

2. Instala las dependencias:

```bash
npm install
```

- ver dependencias 

```bash
npm list
```

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre tu navegador en:  
   [http://localhost:5173](http://localhost:5173)

---

## Características

- Crear una sala de juego con interfaz amigable
- Estimación colaborativa en tiempo real (local)
- Interfaz modular y reutilizable
- Persistencia de datos con `SessionStorage`
- Arquitectura basada en Atomic Design

---

## Configuración

No se requiere configuración adicional. Las dependencias y scripts se gestionan con `npm`.

---

## Dependencias

Listado parcial desde `package.json`:

- `react`
- `react-dom`
- `vite`
- `eslint`

(Ejecuta `npm list` para ver todas las dependencias.)

---

## Contribuyentes

- *Evelyn Rendón Kalil para Pragma*

---

## Licencia

**Este proyecto no utiliza una licencia específica.**
