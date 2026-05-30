// src/components/Voz/VoiceAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('🔴 Presiona el botón para activar');
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  const SILENCE_TIMEOUT = 10000;

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setStatus('❌ Usa Google Chrome');
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
      console.log('🎤 Escuchando...');
      setIsListening(true);
      setIsActive(true);
      setStatus('🎤 Escuchando... Di un comando');
      
      // Timeout de silencio
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setStatus('🔇 Asistente desactivado por inactividad');
      }, SILENCE_TIMEOUT);
    };

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript.toLowerCase();
      }
      
      console.log('📝 Dijiste:', text);
      setStatus(`📢 "${text.substring(0, 40)}"`);
      
      // Resetear timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setStatus('🔇 Asistente desactivado por inactividad');
      }, SILENCE_TIMEOUT);
      
      if (event.results[event.results.length - 1].isFinal) {
        processCommand(text);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Error:', event.error);
      if (event.error === 'not-allowed') {
        setStatus('❌ Permite el micrófono en el candado 🔒');
      } else if (event.error === 'no-speech') {
        setStatus('🔇 No te escuché. Intenta de nuevo');
      }
    };

    recognition.onend = () => {
      console.log('🔇 Reconocimiento terminado');
      setIsListening(false);
      setIsActive(false);
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (e) {
      console.error('Error:', e);
      setStatus('❌ Error al iniciar. Recarga la página');
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
    setStatus('🔴 Presiona el botón para activar');
  };

  const processCommand = (command) => {
    console.log('🎯 Ejecutando comando:', command);
    
    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    
    if (command.includes('inicio') || command.includes('home')) {
      utterance.text = 'Navegando a inicio';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else if (command.includes('productos')) {
      utterance.text = 'Navegando a productos';
      navigate('/productos');
    }
    else if (command.includes('nosotros')) {
      utterance.text = 'Navegando a nosotros';
      navigate('/nosotros');
    }
    else if (command.includes('dietas')) {
      utterance.text = 'Navegando a dietas';
      navigate('/dietas');
    }
    else if (command.includes('configuración')) {
      utterance.text = 'Navegando a configuración';
      navigate('/configuracion');
    }
    else if (command.includes('perfil')) {
      utterance.text = 'Navegando a perfil';
      navigate('/perfil');
    }
    else if (command.includes('login') || command.includes('iniciar')) {
      utterance.text = 'Iniciando sesión';
      navigate('/login');
    }
    else if (command.includes('cerrar') || command.includes('salir')) {
      utterance.text = 'Cerrando sesión';
      localStorage.clear();
      setTimeout(() => window.location.reload(), 500);
    }
    else if (command.includes('notificaciones')) {
      utterance.text = 'Abriendo notificaciones';
      navigate('/notificacionesUser');
    }
    else if (command.includes('populares')) {
      utterance.text = 'Mostrando productos populares';
      document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    }
    else if (command.includes('redes') || command.includes('sociales')) {
      utterance.text = 'Desplazando a redes sociales';
      document.querySelector('.home-find-us')?.scrollIntoView({ behavior: 'smooth' });
    }
    else if (command.includes('arriba')) {
      utterance.text = 'Subiendo página';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else if (command.includes('abajo')) {
      utterance.text = 'Bajando página';
      window.scrollBy({ top: 300, behavior: 'smooth' });
    }
    else if (command.includes('ayuda')) {
      const commands = ['Inicio', 'Productos', 'Nosotros', 'Dietas', 'Configuración', 'Perfil', 'Login', 'Cerrar sesión', 'Notificaciones', 'Populares', 'Redes sociales', 'Arriba', 'Abajo'];
      utterance.text = 'Comandos: ' + commands.join(', ');
      setStatus('🎤 Comandos mostrados');
    }
    else if (command.length > 3) {
      utterance.text = 'Comando no reconocido';
    } else {
      return;
    }
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    
    // Desactivar después del comando
    setTimeout(() => stopListening(), 1000);
  };

  return (
    <div className="voice-assistant">
      <div className={`voice-status ${isActive ? 'active' : ''}`}>
        {status}
      </div>
      <button 
        className="voice-btn"
        onClick={startListening}
        disabled={isListening}
      >
        {isListening ? '🎤' : '🎙️'}
      </button>
    </div>
  );
};

export default VoiceAssistant;