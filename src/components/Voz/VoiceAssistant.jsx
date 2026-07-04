import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import micIcon from '../../img/microfono-icono.png';

const VoiceAssistant = ({ page = 'general' }) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Presiona el botón para activar');
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const SILENCE_TIMEOUT = 10000;

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setStatus('Usa Google Chrome');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log('Escuchando...');
      setIsListening(true);
      setIsActive(true);
      setStatus('Escuchando... Di un comando');
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setStatus('Asistente desactivado por inactividad');
      }, SILENCE_TIMEOUT);
    };

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript.toLowerCase();
      }
      
      console.log('Dijiste:', text);
      setStatus(`"${text.substring(0, 40)}"`);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setStatus('Asistente desactivado por inactividad');
      }, SILENCE_TIMEOUT);
      
      if (event.results[event.results.length - 1].isFinal) {
        processCommand(text);
      }
    };

    recognition.onerror = (event) => {
      console.error('Error:', event.error);
      if (event.error === 'not-allowed') {
        setStatus('Permite el micrófono en el candado 🔒');
      } else if (event.error === 'no-speech') {
        setStatus('No te escuché. Intenta de nuevo');
      }
    };

    recognition.onend = () => {
      console.log('Reconocimiento terminado');
      setIsListening(false);
      setIsActive(false);
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Error:', e);
      setStatus('Error al iniciar. Recarga la página');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setIsActive(false);
    setStatus('Presiona el botón para activar');
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.text = text;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const processCommand = (command) => {
    console.log('Ejecutando comando:', command);
    
    // Comandos generales (funcionan en cualquier página)
    if (command.includes('inicio') || command.includes('home')) {
      speak('Navegando a inicio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.pathname !== '/') navigate('/');
      return;
    }
    
    if (command.includes('arriba')) {
      speak('Subiendo página');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (command.includes('abajo')) {
      speak('Bajando página');
      window.scrollBy({ top: 300, behavior: 'smooth' });
      return;
    }
    
    if (command.includes('ayuda')) {
      let commands = [];
      if (page === 'productos') {
        commands = ['Buscar', 'Limpiar', 'Quemadores', 'Proteínas', 'Fibras', 'Detox', 'Termogénicos', 'Control de apetito', 'Energéticos', 'Vitaminas', 'Populares', 'Carrito', 'Perfil', 'Inicio'];
      } else if (page === 'nosotros') {
        commands = ['Inicio', 'Productos', 'Dietas', 'Configuración', 'Perfil', 'Login', 'Cerrar sesión', 
          'Esencia', 'Misión', 'Visión', 'Valores', 'Objetivo', 'Metas', 'Estadísticas', 
          'Clientes', 'Productos disponibles', 'Satisfacción', 'Calidad certificada', 'Contacto', 'Arriba', 'Abajo'];
      } else if (page === 'general') {
        commands = ['Inicio', 'Productos', 'Nosotros', 'Dietas', 'Configuración', 'Perfil', 'Login', 'Cerrar sesión', 'Notificaciones', 'Redes sociales', 'Arriba', 'Abajo'];
      }
      speak('Comandos: ' + commands.join(', '));
      setStatus('Comandos mostrados');
      return;
    }

    // ========== COMANDOS ESPECÍFICOS PARA PRODUCTOS ==========
    if (page === 'productos') {
      
      // Comandos de búsqueda
      if (command.includes('buscar')) {
        const searchTerm = command.replace('buscar', '').trim();
        if (searchTerm) {
          speak(`Buscando ${searchTerm}`);
          const searchEvent = new CustomEvent('voiceSearch', { detail: { term: searchTerm } });
          window.dispatchEvent(searchEvent);
        } else {
          speak('¿Qué deseas buscar?');
        }
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      // Limpiar búsqueda
      if (command.includes('limpiar') || command.includes('borrar')) {
        speak('Limpiando búsqueda');
        const clearEvent = new CustomEvent('voiceClear');
        window.dispatchEvent(clearEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      // Filtros por categoría
      if (command.includes('quemadores') || command.includes('quemador')) {
        speak('Mostrando quemadores de grasa');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'quemadores' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('proteínas') || command.includes('proteinas') || command.includes('proteina')) {
        speak('Mostrando proteínas');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'proteinas' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('fibras') || command.includes('fibra')) {
        speak('Mostrando fibras y digestivos');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'fibras' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('detox')) {
        speak('Mostrando detox y limpieza');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'detox' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('termogénicos') || command.includes('termogenicos') || command.includes('termogenico')) {
        speak('Mostrando termogénicos');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'termogenicos' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('control de apetito') || command.includes('apetito')) {
        speak('Mostrando control de apetito');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'control_apetito' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('energéticos') || command.includes('energeticos') || command.includes('energetico')) {
        speak('Mostrando energéticos naturales');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'energeticos' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('vitaminas') || command.includes('vitamina')) {
        speak('Mostrando vitaminas y minerales');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'vitaminas' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      // Scroll a secciones
      if (command.includes('populares') || command.includes('populares')) {
        speak('Yendo a productos populares');
        const scrollEvent = new CustomEvent('voiceScroll', { detail: { section: 'populares' } });
        window.dispatchEvent(scrollEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('todos los productos') || (command.includes('todos') && command.includes('productos'))) {
        speak('Yendo a todos los productos');
        const scrollEvent = new CustomEvent('voiceScroll', { detail: { section: 'todos' } });
        window.dispatchEvent(scrollEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      // Navegación específica de productos
      if (command.includes('carrito') || command.includes('carro')) {
        speak('Yendo al carrito');
        navigate('/carrito');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('perfil') || command.includes('mi cuenta')) {
        speak('Yendo a tu perfil');
        navigate('/perfil');
        setTimeout(() => stopListening(), 1000);
        return;
      }
    }

    // ========== COMANDOS ESPECÍFICOS PARA NOSOTROS ==========
    if (page === 'nosotros') {
      
      // Secciones de la página
      if (command.includes('esencia') || command.includes('nuestra esencia')) {
        speak('Yendo a la sección de nuestra esencia');
        const scrollEvent = new CustomEvent('voiceScroll', { detail: { section: 'esencia' } });
        window.dispatchEvent(scrollEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('misión') || command.includes('mision')) {
        speak('Mostrando la misión de Balancea');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'mision' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('visión') || command.includes('vision')) {
        speak('Mostrando la visión de Balancea');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'vision' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('valores')) {
        speak('Mostrando los valores de Balancea');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'valores' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('objetivo')) {
        speak('Mostrando el objetivo de Balancea');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'objetivo' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('metas')) {
        speak('Mostrando las metas de Balancea');
        const filterEvent = new CustomEvent('voiceFilter', { detail: { categoria: 'metas' } });
        window.dispatchEvent(filterEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('estadísticas') || command.includes('estadisticas') || command.includes('números') || command.includes('numeros')) {
        speak('Yendo a la sección de estadísticas');
        const scrollEvent = new CustomEvent('voiceScroll', { detail: { section: 'estadisticas' } });
        window.dispatchEvent(scrollEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      // Información de estadísticas
      if (command.includes('clientes')) {
        speak('Hemos servido a más de 10 mil clientes satisfechos');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('productos disponibles') || (command.includes('productos') && command.includes('tenemos'))) {
        speak('Contamos con más de 50 productos naturales de calidad');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('satisfacción') || command.includes('satisfaccion') || command.includes('recomiendan')) {
        speak('El 98 por ciento de nuestros clientes recomendarían Balancea');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('calidad certificada') || command.includes('certificada')) {
        speak('Nuestros productos son de calidad certificada bajo estrictos estándares');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('contacto') || command.includes('contactar')) {
        speak('Desplazando a la sección de contacto');
        const scrollEvent = new CustomEvent('voiceScroll', { detail: { section: 'footer' } });
        window.dispatchEvent(scrollEvent);
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      // Navegación
      if (command.includes('productos')) {
        speak('Navegando a productos');
        navigate('/productos');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('dietas')) {
        speak('Navegando a dietas');
        navigate('/dietas');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('configuración') || command.includes('configuracion')) {
        speak('Navegando a configuración');
        navigate('/configuracion');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('perfil') || command.includes('mi cuenta')) {
        speak('Yendo a tu perfil');
        navigate('/perfil');
        setTimeout(() => stopListening(), 1000);
        return;
      }
    }

    // ========== COMANDOS GENERALES PARA OTRAS PÁGINAS ==========
    if (page !== 'productos' && page !== 'nosotros') {
      
      if (command.includes('productos')) {
        speak('Navegando a productos');
        navigate('/productos');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('nosotros')) {
        speak('Navegando a nosotros');
        navigate('/nosotros');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('dietas')) {
        speak('Navegando a dietas');
        navigate('/dietas');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('configuración') || command.includes('configuracion')) {
        speak('Navegando a configuración');
        navigate('/configuracion');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('login') || command.includes('iniciar')) {
        speak('Iniciando sesión');
        navigate('/login');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('cerrar') || command.includes('salir')) {
        speak('Cerrando sesión');
        localStorage.clear();
        setTimeout(() => window.location.reload(), 500);
        return;
      }
      
      if (command.includes('notificaciones')) {
        speak('Abriendo notificaciones');
        navigate('/notificacionesUser');
        setTimeout(() => stopListening(), 1000);
        return;
      }
      
      if (command.includes('redes') || command.includes('sociales')) {
        speak('Desplazando a redes sociales');
        document.querySelector('.home-find-us')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => stopListening(), 1000);
        return;
      }
    }

    // Si no se reconoció ningún comando
    if (command.length > 3) {
      speak('Comando no reconocido. Di ayuda para ver los comandos disponibles');
      setTimeout(() => stopListening(), 1000);
    }
  };

  return (
    <div className="voice-assistant">
      <div className={`voice-status ${isActive ? 'active' : ''}`}>
        <span className="status-text">{status}</span>
      </div>
      <button 
        className={`voice-btn ${isListening ? 'active' : ''}`}
        onClick={startListening}
        disabled={isListening}
        aria-label="Asistente de voz"
      >
        {isListening ? (
          <img 
            src={micIcon} 
            alt="Escuchando..." 
            className="voice-icon-img voice-icon-pulse"
          />
        ) : (
          <img 
            src={micIcon} 
            alt="Activar asistente de voz" 
            className="voice-icon-img"
          />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;