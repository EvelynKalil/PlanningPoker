// 1. Importaciones principales de React y hooks
import React, { useEffect, useState } from 'react';
// 2. API de React 18 para montar el árbol de componentes
import ReactDOM from 'react-dom/client';
// 3. Enrutamiento de la aplicación (SPA)
import { BrowserRouter } from 'react-router-dom';
// 4. Proveedor de estado global con Redux
import { Provider } from 'react-redux';
import { store } from './store';
// 5. Componente raíz de la app y pantalla de carga
import App from './components/pages/App';
import SplashScreen from './components/templates/SplashScreen/SplashScreen'; 
// 6. Estilos globales
import './index.css';

// 7. Componente Root que decide si mostrar la Splash o la App
const Root = () => {
  // 7.1 useState para controlar si estamos “cargando” (true) o ya listos (false)
  const [loading, setLoading] = useState(true);

  // 7.2 useEffect que se ejecuta sólo una vez (array de dependencias vacío)
  useEffect(() => {
    // Después de 1.5 segundos, loading = false
    const timeout = setTimeout(() => setLoading(false), 1500);
    // Cleanup: si el componente se desmonta antes de 1.5s, limpiamos el timeout
    return () => clearTimeout(timeout);
  }, []);

  // 7.3 Si seguimos cargando, mostramos SplashScreen; si no, el App completo
  return loading ? <SplashScreen /> : <App />;
};

// 8. Punto de entrada: busca el div#root y montamos todo el árbol React
ReactDOM.createRoot(document.getElementById('root') as HTMLElement) // TypeScript: asserción de tipo

// 9. Modo estricto de React para ayudar a encontrar problemas durante el desarrollo
.render(
  <React.StrictMode>
     {/* 10. Proveedor de Redux (store estará disponible en toda la app) */}
    <Provider store={store}>
      {/* 11. Router para manejar rutas sin recargar la página */}
      <BrowserRouter>
        {/* 12. Componente Root con splash + App */}
        <Root />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
