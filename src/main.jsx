import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConfigProvider from './context/config';

import Home from './pages/Home';
import HomeAdmin from './pages/Home-Admin';
import Login from './components/login/AuthContainer';
import Register from './components/login/Register';
import Configuracion from './components/config/Config';
import Perfil from './components/perfil/Perfil';
import Productos from './components/productos/Productos';
import Crrito from './components/carrito/Carrito';
import Especiales from './components/especiales/Especiales';
import Ingredientes from './components/Ingredientes/Ingredientes';
import Users from './components/users/Users';


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
                    <Route path="/ingredientes" element={<Ingredientes />} />
                    <Route path="/users" element={<Users />} />
                </Routes>
            </Router>
        </ConfigProvider>
    );
}

export default App;