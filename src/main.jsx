import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConfigProvider from './context/config';

import Home from './pages/Home';
import HomeAdmin from './pages/Home-Admin';
import Nosotros from './components/nosotros/Nosotros';
import Login from './components/login/AuthContainer';
import Register from './components/login/Register';
import Configuracion from './components/config/Config';
import Perfil from './components/perfil/Perfil';
import Productos from './components/productos/Productos';
import Crrito from './components/carrito/Carrito';
import Especiales from './components/especiales/Especiales';
import Users from './components/users/Users';
import NotificacionesUser from './components/notificaciones/NotificacionesUser';
import Notificaciones from './components/notificaciones/Notificaciones';
import Ordenes from './components/ordenes/Ordenes';
import Dietas from './components/dietas/Dietas';


function App() {
    return (
        <ConfigProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path='/login' element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/panel-admin" element={<HomeAdmin />} />
                    <Route path="/configuracion" element={<Configuracion />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/carrito" element={<Crrito />} />
                    <Route path="/especiales" element={<Especiales />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/notificacionesUser" element={<NotificacionesUser />} />
                    <Route path="/notificaciones" element={<Notificaciones />} />
                    <Route path="/ordenes" element={<Ordenes />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/dietas" element={<Dietas />} />
                </Routes>
            </Router>
        </ConfigProvider>
    );
}

export default App;