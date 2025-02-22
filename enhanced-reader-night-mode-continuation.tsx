// Défilement jusqu'à l'élément avec comportement lisse
      currentElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

      // Vérifier si c'est un dialogue et le jouer automatiquement
      if (currentElement.getAttribute('data-type') === 'dialogue') {
        handleDialoguePlay();
        // Attendre la fin du dialogue avant de continuer
        setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, 3000); // Durée approximative du dialogue
      } else {
        // Calcul du délai basé sur la longueur du texte
        const textLength = currentElement.textContent.length;
        const delay = Math.max(2000, textLength * 50); // Minimum 2 secondes
        setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
        }, delay);
      }
    };

    const interval = setInterval(scrollContent, 100);
    autoScrollInterval.current = interval;

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isNightModeActive, currentLineIndex, contentLines]);

  // Gestionnaire du mode nuit
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
    }, 2000); // Afficher le message pendant 2 secondes
  };

  // Animation du point de lecture
  const ReadingIndicator = ({ active }) => (
    <div 
      className={`absolute -left-8 w-4 h-4 rounded-full transition-all duration-300 ${
        active ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`}
      style={{ 
        backgroundColor: currentTheme.accent,
        top: '50%',
        transform: 'translateY(-50%)'
      }}
    />
  );

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
        <Timer size={24} />
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

      {/* Modal de minuterie */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text
            }}
          >
            <h3 className="text-xl font-bold mb-4">Mode Bonne Nuit</h3>
            <p className="mb-6">Sélectionnez la durée de la lecture automatique :</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {TIMER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className="p-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-150"
                  style={{
                    backgroundColor: currentTheme.text,
                    color: currentTheme.background
                  }}
                  onClick={() => handleNightMode(option.value)}
                >
                  <Clock size={20} />
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                className="px-6 py-2 rounded transition-colors duration-150"
                style={{
                  backgroundColor: 'transparent',
                  border: `1px solid ${currentTheme.text}`,
                  color: currentTheme.text
                }}
                onClick={() => setShowTimerModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-6 py-2 rounded transition-colors duration-150"
                style={{
                  backgroundColor: currentTheme.accent,
                  color: currentTheme.text
                }}
                onClick={() => handleNightMode()}
              >
                Sans minuterie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal avec indicateur de lecture */}
      <div 
        ref={contentRef}
        className={`flex-grow overflow-y-auto transition-colors duration-150 ${getFontSizeClass()} ${
          isMobile ? 'px-4' : 'pr-16'
        } relative`}
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
            <ReadingIndicator active={isNightModeActive && currentLineIndex === 0} />
            Être pauvre, c'est pas manquer d'argent, enfin, ce n'est pas que ça. C'est avoir moins que les autres. Quand on est jeune, on ne se rend pas compte qu'on l'est, on n'a pas de quoi comparer.
          </p>

          <div 
            data-type="dialogue"
            className="p-4 mb-6 transition-colors duration-150 relative"
            style={{
              borderLeft: `4px solid ${currentTheme.accent}`,
              backgroundColor: isDialoguePlaying ? `${currentTheme.accent}20` : 'transparent'
            }}
          >
            <ReadingIndicator active={isNightModeActive && currentLineIndex === 1} />
            <span className="font-bold">Malone: </span>
            Active-toi.
          </div>

          <p className="mb-6 leading-relaxed relative">
            <ReadingIndicator active={isNightModeActive && currentLineIndex === 2} />
            Même parmi les pauvres, il y a des pauvres et des riches. On a toujours eu cette haine de la ville, de ceux qui avaient tout.
          </p>
        </div>
      </div>

      {/* Styles supplémentaires pour les animations */}
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