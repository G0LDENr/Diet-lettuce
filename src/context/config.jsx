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

            // --- Hero Section ---
            heroTitle: "Crazy Lettuces",
            heroDescription: "El cambio enpieza cuando tu decides transformar tu vida; porque tu decicion es la que crea el equilibrio.",

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
            encuentranosDescription: "Síguenos en nuestras redes sociales para conocer promociones y nuevos productos",

            // --- Footer ---
            footerDescription: "Tu decision crear el equilibrio.",
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
            derechos: "© 2024 Diet Lettuce. Todos los derechos reservados.",

            // --- Configuración ---
            configuracion: 'Configuración',
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
            misionTexto: "Facilitar el acceso a una alimentación saludable a personas con obesidad o que desean mejorar sus hábitos, a través de una plataforma digital que integra la asesoría de nutriólogos con el suministro práctico de ingredientes frescos y adecuados a cada plan nutricional, promoviendo un estilo de vida saludable de manera sencilla y accesible.",
            vision: "Visión",
            visionTexto: "Ser la plataforma líder en Latinoamérica en el acompañamiento nutricional para personas con obesidad, reconocida por innovar en la integración entre profesionales de la salud y la practicidad en la entrega de ingredientes saludables, transformando la experiencia de seguir un tratamiento nutricional en un proceso fácil, efectivo y libre de frustraciones.",
            
            valores: "Valores",
            calidad: "Salud Integral",
            responsabilidadAmbiental: "Respaldo Profesional",
            honestidad: "Compromiso",
            compromisoSalud: "Accesibilidad",
            responsabilidadSocial: "Inovación",
            cuidadoCliente: "Empatia",
            atencionCliente: "Respeto",
            didiplina: "Disciplina",

            objetivo: "Objetivo",
            objetivoTexto: "A tres años, Diet Lettuce se propone consolidarse como la plataforma digital de referencia en México para el apoyo nutricional de personas con obesidad, alcanzando los 5 mil usuarios activos y una red de 150 nutriólogos aliados. Se buscará realizar mil entregas semanales de ingredientes saludables, implementar talleres virtuales mensuales de educación nutricional y desarrollar contenido educativo propio. Asimismo, se establecerán alianzas con instituciones de salud y gimnasios para la derivación de pacientes, se expandirán operaciones a tres ciudades principales del país y se mantendrá un índice de satisfacción superior al 85 por ciento entre usuarios y especialistas, todo ello acompañado de un programa de becas para personas de bajos recursos que requieran tratamiento nutricional.",
            
            metas: "Meta",
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
            footerDescription: "The craziest and most delicious lettuces in the city.",
            productosFooter: "Products",
            lechugasChile: "Lettuce with Chili",
            lechugasGomitas: "Lettuce with Gummies", 
            combosLocos: "Crazy Combos",
            contacto: "Contact",
            direccion: "Mexico, Mexico City",
            telefono: "+52 5538986602", 
            email: "crazylettuces1@gmail.com",
            derechos: "© 2024 Crazy Lettuces. All rights reserved.",

            // --- Configuration ---
            configuracion: 'Settings',
            idioma: 'Language',
            tema: 'Theme',
            modoOscuro: 'Dark Mode',
            modoClaro: 'Light Mode',
            espanol: 'Spanish',
            ingles: 'English',
            minutos: 'Minutes',

            // --- Nosotros ---
            sobreNosotros: "About",
            conoceMas: "Learn more about",
            yNuestraPasion: "and our passion for creating unique experiences",
            mision: "Mission",
            misionTexto: "We are a company dedicated to the production of Crazy Lettuces, lettuce planted, treated and harvested by UTVT students, being a natural, healthy and ecological product without chemicals or preservatives, ensuring healthy consumption for our customers.",
            vision: "Vision",
            visionTexto: "We hope to be a prepared lettuce company for our student community, hoping to offer flavor and freshness, managing to satisfy our customers and increase our sales.",
            valores: "Values",
            calidad: "Quality",
            responsabilidadAmbiental: "Environment Responsibility",
            honestidad: "Honesty",
            compromisoSalud: "Commitment to Health",
            responsabilidadSocial: "Social Responsibility",
            cuidadoCliente: "Customer Care",
            atencionCliente: "Customer Service",
            nuestraHistoria: "Our History",
            historiaTexto1: "was born from the idea of revolutionizing the concept of healthy snacks. We started with a simple question: why not combine the freshness of lettuce with the fun of toppings?",
            historiaTexto2: "Today, we are much more than a lettuce brand. We are creators of experiences, flavor artists and passionate about making every meal a memorable adventure.",

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

            // -- Usuarios --
            users: "Usuarios",

            // -- Especiales --
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