import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sun, Moon, BookOpen, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

const EnhancedReader = () => {
  // États de base
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('reader-volume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('reader-dark-mode');
    return savedMode ? savedMode === 'true' : false;
  });
  const [fontSize, setFontSize] = useState(() => {
    const savedSize = localStorage.getItem('reader-font-size');
    return savedSize || 'medium';
  });
  const [currentChapter, setCurrentChapter] = useState(() => {
    const savedChapter = localStorage.getItem('reader-current-chapter');
    return savedChapter ? parseInt(savedChapter) : 1;
  });
  const [isDialoguePlaying, setIsDialoguePlaying] = useState(false);
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem('reader-progress');
    return savedProgress ? parseFloat(savedProgress) : 0;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
  const [backgroundAudio, setBackgroundAudio] = useState(null);
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Gestionnaire de l'audio d'ambiance
  useEffect(() => {
    const audio = new Audio('https://example.com/ambient-sound.mp3');
    audio.loop = true;
    setBackgroundAudio(audio);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Détecter si l'appareil est mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Gérer l'affichage/masquage des contrôles sur mobile
  useEffect(() => {
    if (!isMobile) {
      setShowControls(true);
      return;
    }

    const handleScroll = (e) => {
      const currentScroll = window.pageYOffset;
      setShowControls(lastScrollPosition > currentScroll || currentScroll < 50);
      setLastScrollPosition(currentScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, lastScrollPosition]);

  // Sauvegarde des préférences utilisateur
  useEffect(() => {
    localStorage.setItem('reader-volume', volume);
    localStorage.setItem('reader-dark-mode', isDarkMode);
    localStorage.setItem('reader-font-size', fontSize);
    localStorage.setItem('reader-current-chapter', currentChapter);
    localStorage.setItem('reader-progress', progress);
  }, [volume, isDarkMode, fontSize, currentChapter, progress]);

  const handleChapterChange = (newChapter) => {
    if (newChapter < 1 || newChapter > 21) return;
    setCurrentChapter(newChapter);
    setProgress(0);
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

      audio.onended = () => {
        setIsDialoguePlaying(false);
        if (backgroundAudio) {
          backgroundAudio.volume = volume;
        }
      };
    } catch (error) {
      console.error('Erreur lors de la lecture du dialogue:', error);
      setIsDialoguePlaying(false);
    }
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

      {/* Contrôles supérieurs - Adaptatifs */}
      <div 
        className={`fixed top-0 right-0 transition-all duration-300 z-40 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        } ${
          isMobile ? 'w-full bg-opacity-90' : 'top-4 right-4'
        }`}
        style={{
          backgroundColor: isMobile ? currentTheme.background : 'transparent'
        }}
      >
        <div className={`flex ${isMobile ? 'justify-between w-full px-4 py-2' : 'gap-4'}`}>
          {/* Taille de texte */}
          <div 
            className="rounded-lg shadow-lg p-2 flex gap-2 transition-colors duration-150"
            style={{ 
              backgroundColor: currentTheme.text,
              color: currentTheme.background
            }}
          >
            {['A', 'A+', 'A++'].map((size, index) => (
              <button 
                key={size}
                className={`px-2 rounded transition-colors duration-150 ${
                  isMobile ? 'py-1' : ''
                }`}
                style={{
                  backgroundColor: fontSize === ['small', 'medium', 'large'][index] 
                    ? currentTheme.accent 
                    : 'transparent',
                  color: fontSize === ['small', 'medium', 'large'][index]
                    ? '#424240'
                    : currentTheme.background
                }}
                onClick={() => setFontSize(['small', 'medium', 'large'][index])}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Mode nuit */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg shadow-lg transition-colors duration-150 flex items-center justify-center"
            style={{
              backgroundColor: currentTheme.text,
              color: currentTheme.background
            }}
          >
            {isDarkMode ? <Sun size={isMobile ? 24 : 20} /> : <Moon size={isMobile ? 24 : 20} />}
          </button>
        </div>
      </div>

      {/* Menu des chapitres - Adaptatif */}
      {showChaptersMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowChaptersMenu(false)}
        >
          <div 
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${
              isMobile ? 'max-w-sm' : 'max-w-md'
            } mx-auto`}
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text
            }}
          >
            <div className="p-4 border-b" style={{ borderColor: currentTheme.accent }}>
              <h3 className="text-xl font-semibold">Chapitres</h3>
            </div>
            <div className="p-4">
              <div className={`grid ${isMobile ? 'grid-cols-5' : 'grid-cols-7'} gap-2`}>
                {Array.from({ length: 21 }, (_, i) => (
                  <button
                    key={i + 1}
                    className="aspect-square rounded transition-colors duration-150 flex items-center justify-center"
                    style={{
                      backgroundColor: currentChapter === i + 1 
                        ? currentTheme.accent
                        : `${currentTheme.text}20`,
                      color: currentChapter === i + 1 
                        ? currentTheme.text
                        : currentTheme.text,
                    }}
                    onClick={() => {
                      handleChapterChange(i + 1);
                      setShowChaptersMenu(false);
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal - Adaptatif */}
      <div 
        className={`flex-grow overflow-y-auto transition-colors duration-150 ${getFontSizeClass()} ${
          isMobile ? 'px-4' : 'pr-16'
        }`}
        onScroll={(e) => {
          const element = e.target;
          const progress = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
          setProgress(progress);
        }}
      >
        <div className={`p-8 mx-auto ${isMobile ? 'w-full' : 'max-w-3xl'}`}>
          {/* Indicateur de chapitre */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold">Chapitre {currentChapter}</h2>
            <p style={{ color: currentTheme.muted }} className="text-sm">
              {currentChapter} / 21
            </p>
          </div>

          <p className="mb-6 leading-relaxed">
            Être pauvre, c'est pas manquer d'argent, enfin, ce n'est pas que ça. C'est avoir moins que les autres. Quand on est jeune, on ne se rend pas compte qu'on l'est, on n'a pas de quoi comparer.
          </p>

          {/* Zone de dialogue - Adaptative */}
          <div 
            className={`p-4 cursor-pointer mb-6 transition-colors duration-150 hover:bg-opacity-25 ${
              isMobile ? 'mx-2' : ''
            }`}
            style={{
              borderLeft: `4px solid ${currentTheme.accent}`,
              backgroundColor: isDialoguePlaying ? `${currentTheme.accent}20` : 'transparent'
            }}
            onClick={handleDialoguePlay}
          >
            <span className="font-bold">Malone: </span>
            Active-toi.
          </div>

          <p className="mb-6 leading-relaxed">
            Même parmi les pauvres, il y a des pauvres et des riches. On a toujours eu cette haine de la ville, de ceux qui avaient tout.
          </p>
        </div>
      </div>

      {/* Contrôle du volume - Adaptatif */}
      <div 
        className={`${
          isMobile 
            ? 'fixed bottom-20 right-4 flex-row items-center bg-opacity-90 rounded-full shadow-lg p-2' 
            : 'fixed right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-4'
        } flex transition-all duration-300 z-30 ${
          showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
        }`}
        style={{
          backgroundColor: isMobile ? currentTheme.background : 'transparent'
        }}
      >
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (backgroundAudio) {
              backgroundAudio.volume = isMuted ? volume : 0;
            }
          }}
          className="p-2 rounded-full shadow-lg"
          style={{
            backgroundColor: currentTheme.text,
            color: currentTheme.background
          }}
        >
          {isMuted ? <VolumeX size={isMobile ? 24 : 20} /> : <Volume2 size={isMobile ? 24 : 20} />}
        </button>
        
        <div className={isMobile ? 'w-32 mx-4' : 'h-48 relative'}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (!isMuted && backgroundAudio) {
                backgroundAudio.volume = newVolume;
              }
            }}
            style={{
              transform: isMobile ? 'none' : 'rotate(-90deg)',
              width: isMobile ? '100%' : '192px',
              transformOrigin: 'center',
              marginRight: isMobile ? '0' : '-82px',
              WebkitAppearance: 'none',
              background: 'transparent',
            }}
            className="volume-slider"
          />
        </div>
      </div>

      {/* Barre de navigation - Adaptative */}
      <nav 
        className={`h-16 relative transition-all duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ 
          backgroundColor: currentTheme.background,
          borderTop: `1px solid ${currentTheme.accent}`
        }}
      >
        <div className={`absolute inset-0 flex items-center ${
          isMobile ? 'justify-around px-2' : 'justify-between px-8'
        }`}>
          <button
            className={`rounded transition-colors duration-150 flex items-center justify-center ${
              isMobile ? 'p-2' : 'px-6 py-2'
            }`}
            style={{
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.accent}`,
              color: currentTheme.text,
            }}
            onClick={() => handleChapterChange(currentChapter - 1)}
            disabled={currentChapter <= 1}
          >
            {isMobile ? <ChevronLeft size={24} /> : '← Précédent'}
          </button>

          <button
            className={`rounded transition-colors duration-150 ${
              isMobile ? 'p-2' : 'px-6 py-2'
            }`}
            style={{
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.accent}`,
              color: currentTheme.text,
            }}
            onClick={() => {
              window.location.href = 'https://audiotalecontact.wixsite.com/audiotale';
            }}
          >
            <BookOpen size={isMobile ? 24 : 20} />
          </button>

          <button
            className={`rounded transition-colors duration-150 ${
              isMobile ? 'p-2' : 'px-6 py-2'
            }`}
            style={{
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.accent}`,
              color: currentTheme.text,
            }}
            onClick={() => setShowChaptersMenu(true)}
          >
            <Menu size={isMobile ? 24 : 20} />
          </button>

          <button
            className={`rounded transition-colors duration-150 flex items-center justify-center ${
              isMobile ? 'p-2' : 'px-6 py-2'
            }`}
            style={{
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.accent}`,
              color: currentTheme.text,
            }}
            onClick={() => handleChapterChange(currentChapter + 1)}
            disabled={currentChapter >= 21}
          >
            {isMobile ? <ChevronRight size={24} /> : 'Suivant →'}
          </button>
        </div>
      </nav>

      {/* Styles pour le slider de volume et les boutons */}
      <style>{`
        .volume-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 2px;
          background: ${currentTheme.text};
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: ${isMobile ? '16px' : '12px'};
          width: ${isMobile ? '16px' : '12px'};
          border-radius: 50%;
          background: ${currentTheme.text};
          margin-top: -7px;
          cursor: pointer;
        }

        .volume-slider::-moz-range-track {
          width: 100%;
          height: 2px;
          background: ${currentTheme.text};
        }

        .volume-slider::-moz-range-thumb {
          height: ${isMobile ? '16px' : '12px'};
          width: ${isMobile ? '16px' : '12px'};
          border-radius: 50%;
          background: ${currentTheme.text};
          border: none;
          margin-top: -7px;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (hover: hover) {
          button:not(:disabled):hover {
            background-color: ${currentTheme.accent} !important;
            color: ${currentTheme.text} !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedReader;