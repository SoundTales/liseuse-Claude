import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sun, Moon, BookOpen, Menu, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

// Composant indicateur de lecture
const ReadingIndicator = ({ active, accentColor }) => (
  <div 
    className={`absolute -left-8 w-4 h-4 rounded-full transition-all duration-300 ${
      active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
    }`}
    style={{ 
      backgroundColor: accentColor,
      top: '50%',
      transform: 'translateY(-50%)'
    }}
  />
);

// Options de minuterie
const TIMER_OPTIONS = [
  { label: '10 minutes', value: 10 * 60 * 1000 },
  { label: '30 minutes', value: 30 * 60 * 1000 },
  { label: '1 heure', value: 60 * 60 * 1000 },
  { label: '2 heures', value: 120 * 60 * 1000 }
];

// Thème
const theme = {
  light: {
    background: '#FAF9F6',
    text: '#2A2A29',
    accent: '#F5FF85',
    muted: '#666664'
  },
  dark: {
    background: '#2A2A29',
    text: '#FAF9F6',
    accent: '#F5FF85',
    muted: '#E6E6E0'
  }
};

const EnhancedReader = () => {
  // États de base
  const [volume, setVolume] = useState(0.5);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isDialoguePlaying, setIsDialoguePlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backgroundAudio, setBackgroundAudio] = useState(null);

  // États du mode nuit
  const [isNightModeActive, setIsNightModeActive] = useState(false);
  const [nightModeTimer, setNightModeTimer] = useState(null);
  const [timerEndTime, setTimerEndTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showNightMessage, setShowNightMessage] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [contentLines, setContentLines] = useState([]);

  // Refs
  const contentRef = useRef(null);
  const autoScrollInterval = useRef(null);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll('p, div[data-type="dialogue"]');
      setContentLines(Array.from(elements));
    }
  }, [currentChapter]);

  useEffect(() => {
    if (!nightModeTimer) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = timerEndTime - now;

      if (timeLeft <= 0) {
        setIsNightModeActive(false);
        setNightModeTimer(null);
        setTimerEndTime(null);
        setRemainingTime(null);
        clearInterval(interval);
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nightModeTimer, timerEndTime]);

  useEffect(() => {
    if (!isNightModeActive || !contentRef.current) return;

    const scrollContent = async () => {
      if (!contentRef.current) return;

      const currentElement = contentLines[currentLineIndex];
      if (!currentElement) {
        if (currentChapter < 21) {
          handleChapterChange(currentChapter + 1);
        } else {
          setIsNightModeActive(false);
        }
        return;
      }

      currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (currentElement.getAttribute('data-type') === 'dialogue') {
        await handleDialoguePlay();
        setTimeout(() => setCurrentLineIndex(prev => prev + 1), 3000);
      } else {
        const textLength = currentElement.textContent.length;
        const delay = Math.max(2000, textLength * 50);
        setTimeout(() => setCurrentLineIndex(prev => prev + 1), delay);
      }
    };

    const interval = setInterval(scrollContent, 100);
    autoScrollInterval.current = interval;

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isNightModeActive, currentLineIndex, contentLines, currentChapter]);

  const formatRemainingTime = (ms) => {
    const minutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h${remainingMinutes}m` : `${minutes}m`;
  };

  const handleChapterChange = (newChapter) => {
    if (newChapter < 1 || newChapter > 21) return;
    setCurrentChapter(newChapter);
    setProgress(0);
    setCurrentLineIndex(0);
  };

  const handleDialoguePlay = async () => {
    if (isDialoguePlaying) return;

    try {
      const audio = new Audio('https://static.wixstatic.com/mp3/b9ad46_8c7063409f8f4fe1836a6a7bb5407f49.mp3');
      audio.volume = isMuted ? 0 : volume;
      
      if (backgroundAudio) {
        backgroundAudio.volume = volume * 0.3;
      }

      await audio.play();
      setIsDialoguePlaying(true);

      return new Promise((resolve) => {
        audio.onended = () => {
          setIsDialoguePlaying(false);
          if (backgroundAudio) {
            backgroundAudio.volume = volume;
          }
          resolve();
        };
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du dialogue:', error);
      setIsDialoguePlaying(false);
      return Promise.resolve();
    }
  };

  const handleNightMode = (timerValue = null) => {
    setShowNightMessage(true);
    setTimeout(() => {
      if (timerValue) {
        const endTime = new Date().getTime() + timerValue;
        setTimerEndTime(endTime);
        setNightModeTimer(timerValue);
      }
      setIsNightModeActive(true);
      setShowTimerModal(false);
      setCurrentLineIndex(0);
      setShowNightMessage(false);
    }, 2000);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-base';
      case 'large': return 'text-xl';
      default: return 'text-lg';
    }
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col transition-colors duration-150"
      style={{
        backgroundColor: currentTheme.background,
        color: currentTheme.text
      }}
    >
      {/* Message de bonne nuit */}
      {showNightMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div 
            className="text-center p-8 rounded-lg transform scale-up"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text
            }}
          >
            <h2 className="text-2xl mb-4">Bonne nuit 🌙</h2>
            <p>Installation du mode lecture automatique...</p>
          </div>
        </div>
      )}

      {/* Bouton Mode Nuit */}
      <button
        onClick={() => setShowTimerModal(true)}
        className={`fixed left-4 top-4 p-3 rounded-full shadow-lg transition-all duration-300 z-40 ${
          isNightModeActive ? 'bg-yellow-400' : ''
        }`}
        style={{
          backgroundColor: isNightModeActive ? currentTheme.accent : currentTheme.text,
          color: isNightModeActive ? currentTheme.text : currentTheme.background
        }}
      >
        <Clock size={24} />
        {remainingTime && (
          <div 
            className="absolute -top-2 -right-2 text-xs rounded-full p-2 flex items-center justify-center"
            style={{
              backgroundColor: currentTheme.text,
              color: currentTheme.background,
              minWidth: '24px',
              height: '24px'
            }}
          >
            {formatRemainingTime(remainingTime)}
          </div>
        )}
      </button>

      {/* Barre de progression */}
      <div 
        className={`fixed top-0 left-0 right-0 h-1 transition-colors duration-150 z-50 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: `${currentTheme.text}20` }}
      >
        <div 
          className="h-full transition-all duration-150"
          style={{ 
            backgroundColor: currentTheme.accent, 
            width: `${progress}%` 
          }}
        />
      </div>

      {/* Contenu principal */}
      <div 
        ref={contentRef}
        className={`flex-grow overflow-y-auto transition-colors duration-150 ${getFontSizeClass()} ${
          isMobile ? 'px-4' : 'pr-16'
        } relative`}
        onScroll={(e) => {
          const element = e.target;
          const progress = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
          setProgress(progress);
        }}
      >
        <div className={`p-8 mx-auto ${isMobile ? 'w-full' : 'max-w-3xl'} relative`}>
          {/* Indicateur de chapitre */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold">Chapitre {currentChapter}</h2>
            <p style={{ color: currentTheme.muted }} className="text-sm">
              {currentChapter} / 21
            </p>
          </div>

          {/* Paragraphes avec indicateur de lecture */}
          <p className="mb-6 leading-relaxed relative">
            <ReadingIndicator 
              active={isNightModeActive && currentLineIndex === 0} 
              accentColor={currentTheme.accent}
            />
            Être pauvre, c'est pas manquer d'argent, enfin, ce n'est pas que ça. C'est avoir moins que les autres. 
            Quand on est jeune, on ne se rend pas compte qu'on l'est, on n'a pas de quoi comparer.
          </p>

          <div 
            data-type="dialogue"
            className="p-4 mb-6 transition-colors duration-150 relative"
            style={{
              borderLeft: `4px solid ${currentTheme.accent}`,
              backgroundColor: isDialoguePlaying ? `${currentTheme.accent}20` : 'transparent'
            }}
            onClick={handleDialoguePlay}
          >
            <ReadingIndicator 
              active={isNightModeActive && currentLineIndex === 1} 
              accentColor={currentTheme.accent}
            />
            <span className="font-bold">Malone: </span>
            Active-toi.
          </div>

          <p className="mb-6 leading-relaxed relative">
            <ReadingIndicator 
              active={isNightModeActive && currentLineIndex === 2} 
              accentColor={currentTheme.accent}
            />
            Même parmi les pauvres, il y a des pauvres et des riches. On a toujours eu cette haine de la ville, 
            de ceux qui avaient tout.
          </p>
        </div>
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .scale-up {
          animation: scale-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EnhancedReader;