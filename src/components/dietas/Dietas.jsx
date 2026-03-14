import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/config';
import { HiMiniUserCircle } from "react-icons/hi2";
import { IoNotificationsCircle } from "react-icons/io5";
import { FaCheck, FaFire, FaApple, FaDumbbell, FaWater, FaClock, FaUtensils, FaInfoCircle, FaTimes } from "react-icons/fa";
import { GiMeal, GiFruitBowl, GiChickenLeg, GiFishMonster, GiEgg, GiBroccoli, GiMilkCarton, GiBowlOfRice, GiBread } from "react-icons/gi";
import '../../css/Dietas/dietas.css';

import logo from '../../img/DietLettuce.png';

const DietaPersonalizada = () => {
  const navigate = useNavigate();
  const { t, darkMode } = useConfig();
  
  // Estados para autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Estados para el formulario de perfil
  const [showProfileForm, setShowProfileForm] = useState(true);
  const [profileData, setProfileData] = useState({
    nombre: '',
    edad: '',
    peso: '',
    altura: '',
    objetivo: 'perder_peso',
    nivelActividad: 'moderado',
    enfermedades: '',
    alergias: '',
    noGusta: '',
    comidasPorDia: '3',
    restricciones: []
  });

  // Estados para la dieta generada
  const [dietaGenerada, setDietaGenerada] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [diaActual, setDiaActual] = useState(0);
  const [comidasHoy, setComidasHoy] = useState([]);
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null);
  const [showRecetaModal, setShowRecetaModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Opciones para selects
  const objetivos = [
    { id: 'perder_peso', nombre: 'Perder Peso', icono: <FaFire /> },
    { id: 'mantener', nombre: 'Mantener Peso', icono: <FaDumbbell /> },
    { id: 'ganar_musculo', nombre: 'Ganar Músculo', icono: <FaDumbbell /> }
  ];

  const nivelesActividad = [
    { id: 'sedentario', nombre: 'Sedentario (poco o ningún ejercicio)' },
    { id: 'ligero', nombre: 'Ligero (ejercicio 1-3 días/semana)' },
    { id: 'moderado', nombre: 'Moderado (ejercicio 3-5 días/semana)' },
    { id: 'activo', nombre: 'Activo (ejercicio 6-7 días/semana)' },
    { id: 'muy_activo', nombre: 'Muy Activo (ejercicio diario intenso)' }
  ];

  const comidasPorDia = [
    { id: '3', nombre: '3 comidas (desayuno, comida, cena)' },
    { id: '4', nombre: '4 comidas (incluye colación)' },
    { id: '5', nombre: '5 comidas (incluye 2 colaciones)' },
    { id: '6', nombre: '6 comidas (cada 3 horas)' }
  ];

  const restriccionesAlimenticias = [
    { id: 'vegetariano', nombre: 'Vegetariano' },
    { id: 'vegano', nombre: 'Vegano' },
    { id: 'sin_gluten', nombre: 'Sin Gluten' },
    { id: 'sin_lactosa', nombre: 'Sin Lactosa' },
    { id: 'bajo_carbohidratos', nombre: 'Bajo en Carbohidratos' },
    { id: 'bajo_grasas', nombre: 'Bajo en Grasas' },
    { id: 'alto_proteina', nombre: 'Alto en Proteína' },
    { id: 'dieta_keto', nombre: 'Dieta Keto' },
    { id: 'paleo', nombre: 'Paleo' },
    { id: 'mediterranea', nombre: 'Mediterránea' }
  ];

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userIsAuthenticated = !!token;
    setIsAuthenticated(userIsAuthenticated);
  }, []);

  // Funciones de autenticación
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    navigate('/');
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRestriccionChange = (e) => {
    const { value, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      restricciones: checked 
        ? [...prev.restricciones, value]
        : prev.restricciones.filter(r => r !== value)
    }));
  };

  // Función para calcular calorías diarias (fórmula de Mifflin-St Jeor)
  const calcularCalorias = () => {
    const peso = parseFloat(profileData.peso) || 70;
    const altura = parseFloat(profileData.altura) || 170;
    const edad = parseFloat(profileData.edad) || 30;
    
    // TMB (Tasa Metabólica Basal) - fórmula general
    let tmb = (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
    
    // Factor de actividad
    const factores = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      activo: 1.725,
      muy_activo: 1.9
    };
    
    let calorias = tmb * (factores[profileData.nivelActividad] || 1.55);
    
    // Ajuste según objetivo
    if (profileData.objetivo === 'perder_peso') {
      calorias -= 500; // Déficit de 500 calorías
    } else if (profileData.objetivo === 'ganar_musculo') {
      calorias += 300; // Superávit de 300 calorías
    }
    
    return Math.round(calorias);
  };

  // Función para generar la dieta personalizada
  const generarDieta = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular carga (en producción, esto sería una llamada a API)
    setTimeout(() => {
      const caloriasDiarias = calcularCalorias();
      
      // Crear dieta basada en el perfil
      const nuevaDieta = {
        perfil: profileData,
        caloriasDiarias,
        fechaInicio: new Date().toISOString(),
        dias: []
      };
      
      // Generar 7 días de dieta
      for (let i = 0; i < 7; i++) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + i);
        
        const comidasDelDia = generarComidasDelDia(caloriasDiarias, profileData, i);
        
        nuevaDieta.dias.push({
          dia: i,
          fecha: fecha.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }),
          completado: false,
          caloriasDia: caloriasDiarias,
          comidas: comidasDelDia
        });
      }
      
      setDietaGenerada(nuevaDieta);
      setComidasHoy(nuevaDieta.dias[0].comidas);
      setShowProfileForm(false);
      setLoading(false);
    }, 1500);
  };

  // Función para generar comidas del día
  const generarComidasDelDia = (caloriasDiarias, perfil, dia) => {
    const numComidas = parseInt(perfil.comidasPorDia) || 3;
    const caloriasPorComida = Math.round(caloriasDiarias / numComidas);
    
    const comidas = [];
    const tipos = ['Desayuno', 'Colación AM', 'Comida', 'Colación PM', 'Cena', 'Colación Nocturna'];
    
    const opcionesAlimentos = {
      proteinas: ['Pollo a la plancha', 'Pechuga de pavo', 'Pescado', 'Salmón', 'Huevos', 'Tofu', 'Lentejas', 'Garbanzos'],
      carbohidratos: ['Arroz integral', 'Quinoa', 'Avena', 'Papa', 'Camote', 'Pan integral', 'Pasta integral'],
      vegetales: ['Brócoli', 'Espinaca', 'Lechuga', 'Zanahoria', 'Pepino', 'Tomate', 'Calabacín', 'Champiñones'],
      frutas: ['Manzana', 'Plátano', 'Naranja', 'Fresas', 'Arándanos', 'Piña', 'Mango', 'Papaya'],
      grasas: ['Aguacate', 'Nueces', 'Almendras', 'Aceite de oliva', 'Semillas de chía', 'Mantequilla de maní']
    };
    
    for (let i = 0; i < numComidas; i++) {
      const tipoComida = tipos[i % tipos.length];
      const esComidaPrincipal = i === 0 || i === 2 || i === 4; // Desayuno, comida, cena
      
      // Seleccionar alimentos aleatorios según preferencias
      let proteinas = [...opcionesAlimentos.proteinas];
      let carbohidratos = [...opcionesAlimentos.carbohidratos];
      let vegetales = [...opcionesAlimentos.vegetales];
      let frutas = [...opcionesAlimentos.frutas];
      let grasas = [...opcionesAlimentos.grasas];
      
      // Filtrar por restricciones (simplificado)
      if (perfil.restricciones.includes('vegetariano') || perfil.restricciones.includes('vegano')) {
        proteinas = proteinas.filter(p => !['Pollo', 'Pechuga', 'Pescado', 'Salmón', 'Huevos'].some(al => p.includes(al)));
        if (perfil.restricciones.includes('vegano')) {
          proteinas = proteinas.filter(p => !['Huevos'].includes(p));
        }
      }
      
      if (perfil.restricciones.includes('sin_gluten')) {
        carbohidratos = carbohidratos.filter(c => !['Pan', 'Pasta', 'Avena'].some(al => c.includes(al)));
      }
      
      if (perfil.restricciones.includes('sin_lactosa')) {
        // No hay lácteos en las opciones por ahora
      }
      
      if (perfil.alergias) {
        const alergias = perfil.alergias.toLowerCase().split(',').map(a => a.trim());
        proteinas = proteinas.filter(p => !alergias.some(a => p.toLowerCase().includes(a)));
        carbohidratos = carbohidratos.filter(c => !alergias.some(a => c.toLowerCase().includes(a)));
        vegetales = vegetales.filter(v => !alergias.some(a => v.toLowerCase().includes(a)));
        frutas = frutas.filter(f => !alergias.some(a => f.toLowerCase().includes(a)));
        grasas = grasas.filter(g => !alergias.some(a => g.toLowerCase().includes(a)));
      }
      
      if (perfil.noGusta) {
        const noGusta = perfil.noGusta.toLowerCase().split(',').map(ng => ng.trim());
        proteinas = proteinas.filter(p => !noGusta.some(ng => p.toLowerCase().includes(ng)));
        carbohidratos = carbohidratos.filter(c => !noGusta.some(ng => c.toLowerCase().includes(ng)));
        vegetales = vegetales.filter(v => !noGusta.some(ng => v.toLowerCase().includes(ng)));
        frutas = frutas.filter(f => !noGusta.some(ng => f.toLowerCase().includes(ng)));
        grasas = grasas.filter(g => !noGusta.some(ng => g.toLowerCase().includes(ng)));
      }
      
      // Asegurar que hay opciones disponibles
      if (proteinas.length === 0) proteinas = ['Proteína alternativa'];
      if (carbohidratos.length === 0) carbohidratos = ['Carbohidrato alternativo'];
      if (vegetales.length === 0) vegetales = ['Vegetal alternativo'];
      if (frutas.length === 0) frutas = ['Fruta alternativa'];
      if (grasas.length === 0) grasas = ['Grasa alternativa'];
      
      const comida = {
        id: i,
        tipo: tipoComida,
        hora: `${7 + i * 3}:00`.padStart(5, '0'),
        completado: false,
        calorias: caloriasPorComida,
        items: []
      };
      
      // Agregar items según el tipo de comida
      if (esComidaPrincipal) {
        comida.items.push({
          nombre: proteinas[Math.floor(Math.random() * proteinas.length)],
          cantidad: '150g',
          preparacion: 'A la plancha con especias',
          icono: <GiChickenLeg />,
          receta: {
            ingredientes: ['150g de proteína', 'Sal y pimienta', 'Aceite de oliva', 'Especias al gusto'],
            pasos: [
              'Sazonar la proteína con sal, pimienta y especias',
              'Calentar una sartén con un poco de aceite',
              'Cocinar por ambos lados hasta que esté dorada',
              'Dejar reposar 5 minutos antes de servir'
            ],
            tiempo: '15-20 minutos'
          }
        });
        
        comida.items.push({
          nombre: carbohidratos[Math.floor(Math.random() * carbohidratos.length)],
          cantidad: '200g',
          preparacion: 'Cocido al dente',
          icono: <GiBowlOfRice />,
          receta: {
            ingredientes: ['200g de carbohidrato', 'Agua', 'Sal'],
            pasos: [
              'Lavar el carbohidrato',
              'Cocer en agua con sal hasta que esté tierno',
              'Escurrir y servir'
            ],
            tiempo: '15-25 minutos'
          }
        });
        
        comida.items.push({
          nombre: vegetales[Math.floor(Math.random() * vegetales.length)],
          cantidad: '100g',
          preparacion: 'Salteado con ajo',
          icono: <GiBroccoli />,
          receta: {
            ingredientes: ['100g de vegetal', 'Ajo picado', 'Aceite de oliva', 'Sal y pimienta'],
            pasos: [
              'Lavar y cortar los vegetales',
              'Calentar una sartén con aceite',
              'Saltear con ajo hasta que estén tiernos',
              'Sazonar con sal y pimienta'
            ],
            tiempo: '10 minutos'
          }
        });
      } else {
        // Colación - más simple
        comida.items.push({
          nombre: frutas[Math.floor(Math.random() * frutas.length)],
          cantidad: '1 unidad',
          preparacion: 'Fresca',
          icono: <GiFruitBowl />,
          receta: {
            ingredientes: ['Fruta fresca'],
            pasos: ['Lavar bien la fruta', 'Cortar en trozos si es necesario', 'Servir'],
            tiempo: '5 minutos'
          }
        });
        
        comida.items.push({
          nombre: grasas[Math.floor(Math.random() * grasas.length)],
          cantidad: '30g',
          preparacion: 'Natural',
          icono: <GiMilkCarton />,
          receta: {
            ingredientes: ['30g de grasa saludable'],
            pasos: ['Servir en un recipiente', 'Consumir acompañando la fruta'],
            tiempo: '2 minutos'
          }
        });
      }
      
      comidas.push(comida);
    }
    
    return comidas;
  };

  // Cambiar día
  const cambiarDia = (nuevoDia) => {
    if (nuevoDia >= 0 && nuevoDia < dietaGenerada.dias.length) {
      setDiaActual(nuevoDia);
      setComidasHoy(dietaGenerada.dias[nuevoDia].comidas);
    }
  };

  // Marcar comida como completada
  const toggleComidaCompletada = (comidaId) => {
    const nuevasComidas = comidasHoy.map(comida => 
      comida.id === comidaId ? { ...comida, completado: !comida.completado } : comida
    );
    
    setComidasHoy(nuevasComidas);
    
    // Actualizar en dietaGenerada
    const nuevaDieta = { ...dietaGenerada };
    nuevaDieta.dias[diaActual].comidas = nuevasComidas;
    
    // Verificar si todas las comidas del día están completadas
    const todasCompletadas = nuevasComidas.every(c => c.completado);
    nuevaDieta.dias[diaActual].completado = todasCompletadas;
    
    setDietaGenerada(nuevaDieta);
  };

  // Ver receta
  const verReceta = (item) => {
    setRecetaSeleccionada(item);
    setShowRecetaModal(true);
  };

  // Función para volver al formulario
  const volverAlFormulario = () => {
    setShowProfileForm(true);
    setDietaGenerada(null);
    setDiaActual(0);
    setComidasHoy([]);
  };

  // Formatear número de calorías
  const formatCalorias = (cal) => {
    return cal.toLocaleString('es-MX');
  };

  // Calcular progreso del día
  const calcularProgreso = () => {
    if (!comidasHoy.length) return 0;
    const completadas = comidasHoy.filter(c => c.completado).length;
    return Math.round((completadas / comidasHoy.length) * 100);
  };

  // Si no está autenticado, mostrar mensaje para iniciar sesión
  if (!isAuthenticated) {
    return (
      <div className={`dieta-container ${darkMode ? 'dark-mode' : ''}`}>
        <header className="dieta-header">
          <nav className="dieta-nav">
            <div className="dieta-nav-brand">
              <div className="dieta-logo-container">
                <img src={logo} alt="Diet Lettuce" className="dieta-logo" />
                <h2>
                  <span className="dieta-crazy-swash">Diet</span> Lettuce
                </h2>
              </div>
            </div>
            <ul className="dieta-nav-menu">
              <li><a href="/">{t('inicio')}</a></li>
              <li><a href="/productos">{t('productos')}</a></li>
              <li><a href="/nosotros">{t('nosotros')}</a></li>
              <li><a href="/configuracion">{t('configuracion')}</a></li>
              <li><a href="/login">{t('login')}</a></li>
            </ul>
          </nav>
        </header>

        <div className="dieta-no-auth">
          <div className="dieta-no-auth-content">
            <h2>Inicia Sesión para acceder a tu plan de dieta personalizado</h2>
            <p>Necesitas estar autenticado para ver y gestionar tu plan de alimentación.</p>
            <button 
              className="dieta-login-btn"
              onClick={handleLoginRedirect}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>

        <footer className="dieta-footer">
          <div className="dieta-container-main">
            <div className="dieta-footer-content">
              <div className="dieta-footer-section">
                <div className="dieta-footer-logo-container">
                  <img src={logo} alt="Diet Lettuce" className="dieta-footer-logo" />
                  <h3>
                    <span className="dieta-crazy-swash">Diet</span> Lettuce
                  </h3>
                </div>
                <p>Suplementos y planes de alimentación para tu salud y bienestar</p>
              </div>
              <div className="dieta-footer-section">
                <h4>Enlaces</h4>
                <ul>
                  <li><a href="/">Inicio</a></li>
                  <li><a href="/productos">Productos</a></li>
                  <li><a href="/nosotros">Nosotros</a></li>
                </ul>
              </div>
              <div className="dieta-footer-section">
                <h4>Contacto</h4>
                <ul>
                  <li>México, CDMX</li>
                  <li>+52 55 1234 5678</li>
                  <li>info@dietlettuce.com</li>
                </ul>
              </div>
            </div>
            <div className="dieta-footer-bottom">
              <p>&copy; 2024 Diet Lettuce. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className={`dieta-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <header className="dieta-header">
        <nav className="dieta-nav">
          <div className="dieta-nav-brand">
            <div className="dieta-logo-container">
              <img src={logo} alt="Diet Lettuce" className="dieta-logo" />
              <h2>
                <span className="dieta-crazy-swash">Diet</span> Lettuce
              </h2>
            </div>
          </div>
          <ul className="dieta-nav-menu">
            <li><a href="/">{t('inicio')}</a></li>
            <li><a href="/productos">{t('productos')}</a></li>
            <li><a href="/nosotros">{t('nosotros')}</a></li>
            <li><a href="/configuracion">{t('configuracion')}</a></li>
            <li><a href="/login">{t('login')}</a></li>
            <li className="nav-profile-icon">
              <a href="/perfil" title="Mi Perfil">
                <HiMiniUserCircle className="profile-icon" />
              </a>
            </li>
            <li className="nav-profile-icon">
              <a href="/notificacionesUser" title="Notificaciones">
                <IoNotificationsCircle className="profile-icon" />
              </a>
            </li>
            {isAuthenticated && (
              <li>
                <button 
                  onClick={handleLogout} 
                  className="dieta-logout-btn"
                  title="Cerrar Sesión"
                >
                  Cerrar Sesión
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="dieta-hero">
        <div className="dieta-container-main">
          <h1 className="dieta-title">
            Tu Plan de <span className="dieta-crazy-swash-hero">Alimentación Personalizado</span>
          </h1>
          <p className="dieta-subtitle">
            Descubre una dieta adaptada a tus necesidades, objetivos y preferencias alimenticias
          </p>
        </div>
      </section>

      <div className="dieta-main-content">
        <div className="dieta-container-main">
          {/* Formulario de Perfil */}
          {showProfileForm ? (
            <div className="dieta-profile-form-container">
              <h2 className="dieta-section-title">Cuéntanos sobre ti</h2>
              <p className="dieta-section-subtitle">
                Completa esta información para generar tu plan de alimentación personalizado
              </p>
              
              <form onSubmit={generarDieta} className="dieta-profile-form">
                <div className="dieta-form-grid">
                  <div className="dieta-form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={profileData.nombre}
                      onChange={handleInputChange}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Edad *</label>
                    <input
                      type="number"
                      name="edad"
                      value={profileData.edad}
                      onChange={handleInputChange}
                      placeholder="Años"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Peso (kg) *</label>
                    <input
                      type="number"
                      name="peso"
                      value={profileData.peso}
                      onChange={handleInputChange}
                      placeholder="Ej: 70"
                      step="0.1"
                      min="20"
                      max="300"
                      required
                    />
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Altura (cm) *</label>
                    <input
                      type="number"
                      name="altura"
                      value={profileData.altura}
                      onChange={handleInputChange}
                      placeholder="Ej: 170"
                      min="100"
                      max="250"
                      required
                    />
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Objetivo principal *</label>
                    <select
                      name="objetivo"
                      value={profileData.objetivo}
                      onChange={handleInputChange}
                      required
                    >
                      {objetivos.map(obj => (
                        <option key={obj.id} value={obj.id}>{obj.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Nivel de actividad *</label>
                    <select
                      name="nivelActividad"
                      value={profileData.nivelActividad}
                      onChange={handleInputChange}
                      required
                    >
                      {nivelesActividad.map(act => (
                        <option key={act.id} value={act.id}>{act.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Comidas por día *</label>
                    <select
                      name="comidasPorDia"
                      value={profileData.comidasPorDia}
                      onChange={handleInputChange}
                      required
                    >
                      {comidasPorDia.map(com => (
                        <option key={com.id} value={com.id}>{com.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Enfermedades (opcional)</label>
                    <input
                      type="text"
                      name="enfermedades"
                      value={profileData.enfermedades}
                      onChange={handleInputChange}
                      placeholder="Ej: Diabetes, hipertensión"
                    />
                    <small className="dieta-form-hint">Separa con comas</small>
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Alergias alimentarias (opcional)</label>
                    <input
                      type="text"
                      name="alergias"
                      value={profileData.alergias}
                      onChange={handleInputChange}
                      placeholder="Ej: Mariscos, lácteos, gluten"
                    />
                    <small className="dieta-form-hint">Separa con comas</small>
                  </div>
                  
                  <div className="dieta-form-group">
                    <label>Alimentos que no te gustan (opcional)</label>
                    <input
                      type="text"
                      name="noGusta"
                      value={profileData.noGusta}
                      onChange={handleInputChange}
                      placeholder="Ej: Brócoli, pescado, hígado"
                    />
                    <small className="dieta-form-hint">Separa con comas</small>
                  </div>
                </div>
                
                <div className="dieta-form-group full-width">
                  <label>Preferencias dietéticas (opcional)</label>
                  <div className="dieta-restricciones-grid">
                    {restriccionesAlimenticias.map(rest => (
                      <label key={rest.id} className="dieta-checkbox-label">
                        <input
                          type="checkbox"
                          value={rest.id}
                          checked={profileData.restricciones.includes(rest.id)}
                          onChange={handleRestriccionChange}
                        />
                        <span>{rest.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="dieta-form-actions">
                  <button 
                    type="submit" 
                    className="dieta-generar-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="dieta-spinner"></span>
                        Generando tu plan...
                      </>
                    ) : (
                      'Generar mi Plan de Alimentación'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Tabla de Dieta */
            <div className="dieta-plan-container">
              {dietaGenerada && (
                <>
                  {/* Cabecera del plan */}
                  <div className="dieta-plan-header">
                    <div className="dieta-plan-info">
                      <h2>Plan de {dietaGenerada.perfil.nombre || 'Alimentación'}</h2>
                      <div className="dieta-plan-meta">
                        <span className="dieta-meta-item">
                          <FaFire /> {formatCalorias(dietaGenerada.caloriasDiarias)} kcal/día
                        </span>
                        <span className="dieta-meta-item">
                          <GiMeal /> {dietaGenerada.perfil.comidasPorDia} comidas
                        </span>
                        <span className="dieta-meta-item">
                          <FaDumbbell /> {objetivos.find(o => o.id === dietaGenerada.perfil.objetivo)?.nombre}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="dieta-edit-profile-btn"
                      onClick={volverAlFormulario}
                    >
                      Editar Perfil
                    </button>
                  </div>
                  
                  {/* Navegador de días */}
                  <div className="dieta-dias-navigator">
                    <button 
                      className="dieta-nav-btn"
                      onClick={() => cambiarDia(diaActual - 1)}
                      disabled={diaActual === 0}
                    >
                      ← Anterior
                    </button>
                    
                    <div className="dieta-dias-indicador">
                      {dietaGenerada.dias.map((dia, idx) => (
                        <button
                          key={idx}
                          className={`dieta-dia-boton ${idx === diaActual ? 'activo' : ''} ${dia.completado ? 'completado' : ''}`}
                          onClick={() => cambiarDia(idx)}
                        >
                          <span className="dieta-dia-nombre">Día {idx + 1}</span>
                          {dia.completado && <FaCheck className="dieta-dia-check" />}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      className="dieta-nav-btn"
                      onClick={() => cambiarDia(diaActual + 1)}
                      disabled={diaActual === dietaGenerada.dias.length - 1}
                    >
                      Siguiente →
                    </button>
                  </div>
                  
                  {/* Día actual */}
                  <div className="dieta-dia-actual">
                    <h3 className="dieta-dia-titulo">
                      {dietaGenerada.dias[diaActual].fecha}
                    </h3>
                    
                    {/* Barra de progreso */}
                    <div className="dieta-progreso-container">
                      <div className="dieta-progreso-bar">
                        <div 
                          className="dieta-progreso-fill"
                          style={{ width: `${calcularProgreso()}%` }}
                        ></div>
                      </div>
                      <span className="dieta-progreso-texto">
                        {calcularProgreso()}% completado
                      </span>
                    </div>
                    
                    {/* Comidas del día */}
                    <div className="dieta-comidas-grid">
                      {comidasHoy.map(comida => (
                        <div key={comida.id} className={`dieta-comida-card ${comida.completado ? 'completado' : ''}`}>
                          <div className="dieta-comida-header">
                            <div className="dieta-comida-tipo">
                              <h4>{comida.tipo}</h4>
                              <span className="dieta-comida-hora">
                                <FaClock /> {comida.hora}
                              </span>
                            </div>
                            <div className="dieta-comida-calorias">
                              {comida.calorias} kcal
                            </div>
                          </div>
                          
                          <div className="dieta-comida-items">
                            {comida.items.map((item, idx) => (
                              <div key={idx} className="dieta-item" onClick={() => verReceta(item)}>
                                <div className="dieta-item-icon">
                                  {item.icono || <GiMeal />}
                                </div>
                                <div className="dieta-item-info">
                                  <div className="dieta-item-nombre">{item.nombre}</div>
                                  <div className="dieta-item-detalles">
                                    <span className="dieta-item-cantidad">{item.cantidad}</span>
                                    <span className="dieta-item-preparacion">{item.preparacion}</span>
                                  </div>
                                </div>
                                <FaInfoCircle className="dieta-item-info-icon" />
                              </div>
                            ))}
                          </div>
                          
                          <div className="dieta-comida-footer">
                            <button 
                              className={`dieta-completar-btn ${comida.completado ? 'completado' : ''}`}
                              onClick={() => toggleComidaCompletada(comida.id)}
                            >
                              {comida.completado ? (
                                <>✓ Completado</>
                              ) : (
                                <>Marcar como completado</>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tabla de nutrientes */}
                  <div className="dieta-tabla-nutrientes">
                    <h3>Resumen Nutricional del Día</h3>
                    <div className="dieta-nutrientes-grid">
                      <div className="dieta-nutriente-card">
                        <div className="dieta-nutriente-header">
                          <FaFire className="dieta-nutriente-icon" />
                          <span>Calorías</span>
                        </div>
                        <div className="dieta-nutriente-valor">
                          {dietaGenerada.dias[diaActual].caloriasDia} kcal
                        </div>
                      </div>
                      
                      <div className="dieta-nutriente-card">
                        <div className="dieta-nutriente-header">
                          <GiChickenLeg className="dieta-nutriente-icon" />
                          <span>Proteínas</span>
                        </div>
                        <div className="dieta-nutriente-valor">
                          {Math.round(dietaGenerada.dias[diaActual].caloriasDia * 0.3 / 4)} g
                        </div>
                      </div>
                      
                      <div className="dieta-nutriente-card">
                        <div className="dieta-nutriente-header">
                          <GiBowlOfRice className="dieta-nutriente-icon" />
                          <span>Carbohidratos</span>
                        </div>
                        <div className="dieta-nutriente-valor">
                          {Math.round(dietaGenerada.dias[diaActual].caloriasDia * 0.4 / 4)} g
                        </div>
                      </div>
                      
                      <div className="dieta-nutriente-card">
                        <div className="dieta-nutriente-header">
                          <GiMilkCarton className="dieta-nutriente-icon" />
                          <span>Grasas</span>
                        </div>
                        <div className="dieta-nutriente-valor">
                          {Math.round(dietaGenerada.dias[diaActual].caloriasDia * 0.3 / 9)} g
                        </div>
                      </div>
                      
                      <div className="dieta-nutriente-card">
                        <div className="dieta-nutriente-header">
                          <FaWater className="dieta-nutriente-icon" />
                          <span>Agua recomendada</span>
                        </div>
                        <div className="dieta-nutriente-valor">
                          2.5 litros
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Receta */}
      {showRecetaModal && recetaSeleccionada && (
        <div className="dieta-modal-overlay" onClick={() => setShowRecetaModal(false)}>
          <div className="dieta-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="dieta-modal-header">
              <h2>{recetaSeleccionada.nombre}</h2>
              <button 
                className="dieta-modal-close"
                onClick={() => setShowRecetaModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="dieta-modal-body">
              <div className="dieta-receta-info">
                <div className="dieta-receta-icon">
                  {recetaSeleccionada.icono || <GiMeal />}
                </div>
                <div className="dieta-receta-detalles">
                  <p><strong>Cantidad:</strong> {recetaSeleccionada.cantidad}</p>
                  <p><strong>Preparación:</strong> {recetaSeleccionada.preparacion}</p>
                  <p><strong>Tiempo estimado:</strong> {recetaSeleccionada.receta?.tiempo || '15 minutos'}</p>
                </div>
              </div>
              
              <div className="dieta-receta-ingredientes">
                <h3>Ingredientes</h3>
                <ul>
                  {recetaSeleccionada.receta?.ingredientes?.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  )) || (
                    <>
                      <li>Ingrediente principal</li>
                      <li>Sal y pimienta al gusto</li>
                      <li>Especias al gusto</li>
                    </>
                  )}
                </ul>
              </div>
              
              <div className="dieta-receta-pasos">
                <h3>Preparación</h3>
                <ol>
                  {recetaSeleccionada.receta?.pasos?.map((paso, idx) => (
                    <li key={idx}>{paso}</li>
                  )) || (
                    <>
                      <li>Lavar y preparar los ingredientes</li>
                      <li>Cocinar a fuego medio hasta que esté listo</li>
                      <li>Servir caliente y disfrutar</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
            
            <div className="dieta-modal-footer">
              <button 
                className="dieta-modal-btn"
                onClick={() => setShowRecetaModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="dieta-footer">
        <div className="dieta-container-main">
          <div className="dieta-footer-content">
            <div className="dieta-footer-section">
              <div className="dieta-footer-logo-container">
                <img src={logo} alt="Diet Lettuce" className="dieta-footer-logo" />
                <h3>
                  <span className="dieta-crazy-swash">Diet</span> Lettuce
                </h3>
              </div>
              <p>Suplementos y planes de alimentación para tu salud y bienestar</p>
            </div>
            <div className="dieta-footer-section">
              <h4>Enlaces</h4>
              <ul>
                <li><a href="/">Inicio</a></li>
                <li><a href="/productos">Productos</a></li>
                <li><a href="/nosotros">Nosotros</a></li>
                <li><a href="/dieta">Plan de Dieta</a></li>
              </ul>
            </div>
            <div className="dieta-footer-section">
              <h4>Contacto</h4>
              <ul>
                <li>México, CDMX</li>
                <li>+52 55 1234 5678</li>
                <li>info@dietlettuce.com</li>
              </ul>
            </div>
          </div>
          <div className="dieta-footer-bottom">
            <p>&copy; 2024 Diet Lettuce. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DietaPersonalizada;