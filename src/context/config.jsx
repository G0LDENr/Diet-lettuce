import React, { createContext, useContext, useState, useEffect } from 'react';
import '../css/Config/config.css';

// Crear el contexto de configuración
const ConfigContext = createContext();

// Hook personalizado para usar el contexto
export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig debe ser usado dentro de un ConfigProvider');
    }
    return context;
};

// Proveedor del contexto
export const ConfigProvider = ({ children }) => {
    const [language, setLanguage] = useState('es');
    const [darkMode, setDarkMode] = useState(false);

    // Cargar configuración desde localStorage al iniciar
    useEffect(() => {
        const savedLanguage = localStorage.getItem('app-language');
        const savedDarkMode = localStorage.getItem('app-darkMode');
        
        if (savedLanguage) setLanguage(savedLanguage);
        if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    }, []);

    // Textos para diferentes idiomas
    const texts = {
        es: {
            // --- Navegación ---
            inicio: "Inicio",
            productos: "Productos", 
            nosotros: "Nosotros",
            dietas: "Dietas",
            configuracion: "Configuración",

            // --- Hero Section ---
            heroTitle: "Crazy Lettuces",
            heroDescription: "El cambio empieza cuando tu decides tranformar tu vida; porque tu decision es la que crea el equilibrio.",

            // --- Productos ---
            productosTitle: "Nuestros Productos Locos",
            comboFreshName: "Combo Fresh",
            comboFreshDescription: "Lechuga crujiente con limón y sal. Simple, ligera y deliciosa.",
            crazySpicyName: "Crazy Spicy", 
            crazySpicyDescription: "Chamoy, chile Miguelito y limón sobre lechugas frescas. ¡Un toque loco y picante!",
            comboLocoName: "Combo Loco",
            comboLocoDescription: "Lechuga con gomitas, cacahuates y topping al gusto. ¡El sabor más divertido!",

            // --- Encuéntranos ---
            encuentranosTitle: "Encuéntranos",
            encuentranosDescription: "Síguenos en nuestras redes sociales para conocer",
            encuentranosDescription2: "promociones y nuevos productos",
            footerSubDescription3: "suplementos de calidad para una vida mas saludable y balanceada",

            // --- Footer ---
            footerDescription: "EQUILIBRA TU VIDA",
            footerSubDescription: "Tu decisión crea el equilibrio.",
            heroSubDescription: "Cada pequeño paso que das con convicción fortalece ese equilibrio. Alarga ese momento presente, respira profundo y actúa desde tu poder interior, tejiendo una nueva realidad, más auténtica y profundamente tuya.",
            productosFooter: "Productos",
            lechugasChile: "Lechugas con Chile",
            lechugasGomitas: "Lechugas con Gomitas", 
            combosLocos: "Combos Locos",
            contacto: "Contacto",
            direccion: "México, Ciudad de México",
            telefono1: "Villavicencio Gonzalez Juan Carlos +52 7294030702",
            telefono2: "Jiménez Ocampo Amanda Carolina +52 7292948980",
            telefono3: "Arzte Neri Axel +52 7226780112",
            telefono4: "Lopez Villar Miguel Angel +52 7226165733",
            email: "dietlettuce1@gmail.com",
            derechos: "© 2024 balancea. Todos los derechos reservados.",
            telefono_menu: "+52 7294030702",
            horario: "Horario: Lun-Vie 9am-6pm",

            // --- Configuración ---
            idioma: 'Idioma',
            tema: 'Tema',
            modoOscuro: 'Modo Oscuro',
            modoClaro: 'Modo Claro',
            espanol: 'Español',
            ingles: 'Inglés',
            minutos: 'Minutos',

            // --- Nosotros ---
            sobreNosotros: "",
            conoceMas: "",
            yNuestraPasion: "Nuestra pasión por transformar la alimentación en una experiencia accesible y saludable, explorando nuevas formas de facilitar el bienestar sin perder de vista la frescura, el respaldo profesional y el compromiso con la salud de quienes confían en nosotros.",
            
            mision: "Misión",
            misionTexto: "Mejorar la calidad de vida de las personas ofreciendo suplementos naturales, seguros y efectivos que promuevan la salud y el bienestar integral.",
            vision: "Visión",
            visionTexto: "Ser la marca líder en suplementos naturales en Latinoamérica, reconocida por nuestra calidad, innovación y compromiso con la salud de nuestros clientes.",
            
            valores: "Valores",
            calidad: "Calidad",
            integridad: "Integridad",
            compromiso: "Compromiso",
            innovacion: "Innovación",
            respeto: "Respeto",

            objetivo: "Objetivo",
            objetivoTexto: "Brindar suplementos de la más alta calidad que apoyen el desarrollo de hábitos saludables y ayuden a nuestros clientes a alcanzar su mejor versión.",
            
            metas: "Metas",
            meta1: "Ampliar nuestra linea de productos naturales.",
            meta2: "Alcanzar a más personas con informacion y educacion.",
            meta3: "Ser una empresa sostenible y responsable.",
            metasTexto: "Durante el primer año, Diet Lettuce tiene como meta lanzar oficialmente su plataforma digital y alcanzar 500 usuarios activos, con la participación de al menos 30 nutriólogos aliados y la realización de 100 entregas semanales de ingredientes saludables. Además, se buscará mantener un 80 por ciento de satisfacción entre los usuarios y establecer alianzas estratégicas con al menos tres proveedores locales de productos frescos, asegurando así una operación eficiente y de calidad desde el inicio.",

            // --- Panel de Administración ---
            settings: "Configuración",
            logout: "Cerrar sesión", 
            welcomeAdmin: "Bienvenido al Panel de Administración",
            selectOption: "Selecciona una opción del menú",
            administrator: "Administrador",
            user: "Usuario",
            unknown: "Desconocido",
            
            // --- Configuración Admin ---
            cambiarTema: "Cambiar tema",
            cambiarIdioma: "Cambiar idioma",
            personalizaExperiencia: "Personaliza tu experiencia",
            generalSettings: "Configuración General",
            preferences: "Preferencias", 
            security: "Seguridad",
            Users: "Usuarios",

            // -- Usuarios --
            users: "Usuarios",

            // -- Especiales --
            specials: "Especiales",
        },
        
        en: {
            // --- Navigation ---
            inicio: "Home",
            productos: "Products",
            nosotros: "About Us",
            dietas: "Diets",
            configuracion: "Settings",

            // --- Hero Section ---
            heroTitle: "Crazy Lettuces", 
            heroDescription: "The craziest and most delicious lettuces with chili, gummies, and lots of flavor. A unique experience for your palate!",

            // --- Products ---
            productosTitle: "Our Crazy Products",
            comboFreshName: "🥗 Fresh Combo",
            comboFreshDescription: "Crispy lettuce with lemon and salt. Simple, light, and delicious. 🥬✨",
            crazySpicyName: "🌶️ Crazy Spicy",
            crazySpicyDescription: "Chamoy, Miguelito chili, and lemon on fresh lettuce. A crazy and spicy touch! 🔥😋",
            comboLocoName: "😵‍💫 Crazy Combo",
            comboLocoDescription: "Lettuce with gummies, peanuts, and topping of your choice. The most fun flavor! 🍬🥜",

            // --- Find Us ---
            encuentranosTitle: "Find Us",
            encuentranosDescription: "Follow us on our social media to learn about promotions and new products",

            // --- Footer ---
            footerDescription: "BALANCE YOUR LIFE",
            footerSubDescription: "Your decision creates balance.",
            productosFooter: "Products",
            lechugasChile: "Lettuce with Chili",
            lechugasGomitas: "Lettuce with Gummies", 
            combosLocos: "Crazy Combos",
            contacto: "Contact",
            direccion: "Mexico, Mexico City",
            telefono1: "Villavicencio Gonzalez Juan Carlos +52 7294030702",
            telefono2: "Jiménez Ocampo Amanda Carolina +52 7292948980",
            telefono3: "Arzte Neri Axel +52 7226780112",
            telefono4: "Lopez Villar Miguel Angel +52 7226165733",
            email: "dietlettuce1@gmail.com",
            derechos: "© 2024 Balancea. All rights reserved.",
            telefono_menu: "+52 7294030702",
            horario: "Hours: Mon-Fri 9am-6pm",

            // --- Configuration ---
            idioma: 'Language',
            tema: 'Theme',
            modoOscuro: 'Dark Mode',
            modoClaro: 'Light Mode',
            espanol: 'Spanish',
            ingles: 'English',
            minutos: 'Minutes',

            // --- About Us ---
            sobreNosotros: "About",
            conoceMas: "Learn more about",
            yNuestraPasion: "and our passion for creating unique experiences",
            mision: "Mission",
            misionTexto: "Improve people's quality of life by offering natural, safe and effective supplements that promote health and comprehensive well-being.",
            vision: "Vision",
            visionTexto: "To be the leading natural supplement brand in Latin America, recognized for our quality, innovation and commitment to our customers' health.",
            
            valores: "Values",
            calidad: "Quality",
            integridad: "Integrity",
            compromiso: "Commitment",
            innovacion: "Innovation",
            respeto: "Respect",

            objetivo: "Objective",
            objetivoTexto: "Provide the highest quality supplements that support the development of healthy habits and help our customers reach their best version.",
            
            metas: "Goals",
            meta1: "Reach 5000 satisfied customers in the first year",
            meta2: "Expand presence to 3 more cities in the next year",
            meta3: "Develop 5 new natural products by 2025",
            metasTexto: "During the first year, Diet Lettuce aims to officially launch its digital platform and reach 500 active users, with the participation of at least 30 allied nutritionists and 100 weekly deliveries of healthy ingredients. Additionally, it will seek to maintain 80 percent user satisfaction and establish strategic alliances with at least three local fresh produce suppliers, thus ensuring efficient and quality operations from the start.",

            // --- Admin Panel ---
            settings: "Settings", 
            logout: "Logout",
            welcomeAdmin: "Welcome to Admin Panel",
            selectOption: "Select an option from the menu",
            administrator: "Administrator",
            user: "User",
            unknown: "Unknown",
            
            // --- Admin Configuration ---
            cambiarTema: "Change theme",
            cambiarIdioma: "Change language", 
            personalizaExperiencia: "Personalize your experience",
            generalSettings: "General Settings",
            preferences: "Preferences",
            security: "Security",
            Users: "Users",

            // -- Users --
            users: "Users",

            // -- Specials --
            specials: "Specials",
        }
    };

    // Cambiar idioma
    const toggleLanguage = () => {
        const newLanguage = language === 'es' ? 'en' : 'es';
        setLanguage(newLanguage);
        localStorage.setItem('app-language', newLanguage);
    };

    // Cambiar modo oscuro
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('app-darkMode', JSON.stringify(newDarkMode));
        
        // Aplicar clase al body para modo oscuro
        if (newDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Aplicar modo oscuro al cargar
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    // Obtener texto traducido
    const t = (key) => {
        return texts[language]?.[key] || key;
    };

    const value = {
        language,
        darkMode,
        toggleLanguage,
        toggleDarkMode,
        t
    };

    return (
        <ConfigContext.Provider value={value}>
            {children}
        </ConfigContext.Provider>
    );
};

// Componente Config para mostrar los botones de configuración
export const Config = () => {
    const { language, darkMode, toggleLanguage, toggleDarkMode, t } = useConfig();

    return (
        <div className="config-container">
            <div className="config-buttons">
                {/* Botón de cambio de idioma */}
                <button 
                    onClick={toggleLanguage}
                    className="config-button language-button"
                    title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                >
                    <span className="config-button-icon"></span>
                    <span className="config-button-text">
                        {language === 'es' ? 'ES' : 'EN'}
                    </span>
                </button>

                {/* Botón de modo oscuro/claro */}
                <button 
                    onClick={toggleDarkMode}
                    className="config-button theme-button"
                    title={darkMode ? t('modoClaro') : t('modoOscuro')}
                >
                    <span className="config-button-icon">
                        {darkMode ? '' : ''}
                    </span>
                    <span className="config-button-text">
                        {darkMode ? t('modoClaro') : t('modoOscuro')}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ConfigProvider;