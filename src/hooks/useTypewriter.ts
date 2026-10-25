import { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';

interface UseTypewriterOptions {
  speed?: number; // ms por caractere
  soundBlip?: boolean;
  onComplete?: () => void;
}

export function useTypewriter(
  fullText: string,
  options: UseTypewriterOptions = {}
) {
  const { speed = 25, soundBlip = true, onComplete } = options;

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const indexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Limpa o timer ativo
  const clearTypingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Força conclusão imediata do texto
  const skipTyping = useCallback(() => {
    clearTypingTimeout();
    setDisplayedText(fullText);
    setIsTyping(false);
    indexRef.current = fullText.length;
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [fullText, clearTypingTimeout]);

  // Efeito principal de digitação
  useEffect(() => {
    clearTypingTimeout();
    setDisplayedText('');
    setIsTyping(true);
    indexRef.current = 0;

    if (!fullText) {
      setIsTyping(false);
      return;
    }

    const typeNextChar = () => {
      indexRef.current += 1;
      const nextSlice = fullText.slice(0, indexRef.current);
      setDisplayedText(nextSlice);

      // Toca um blip suave a cada 2 caracteres
      if (soundBlip && indexRef.current % 2 === 0) {
        soundEngine.playTypeBlip();
      }

      if (indexRef.current < fullText.length) {
        // Variação de pontuação: pausa maior após vírgula, ponto, reticências
        const lastChar = nextSlice.slice(-1);
        let charDelay = speed;
        if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
          charDelay = speed * 6;
        } else if (lastChar === ',' || lastChar === ';') {
          charDelay = speed * 3;
        }

        timeoutRef.current = window.setTimeout(typeNextChar, charDelay);
      } else {
        setIsTyping(false);
        timeoutRef.current = null;
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    timeoutRef.current = window.setTimeout(typeNextChar, speed);

    return () => {
      clearTypingTimeout();
    };
  }, [fullText, speed, soundBlip, clearTypingTimeout]);

  return {
    displayedText,
    isTyping,
    skipTyping,
  };
}

