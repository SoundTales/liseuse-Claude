import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sun, Moon, BookOpen, Menu, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

// [Composants et constantes précédents restent identiques...]

const EnhancedReader = () => {
  // [États et hooks précédents restent identiques...]

  // [Ajout après le bouton Mode Nuit et avant le contenu principal]
      {/* Contrôles supérieurs */}
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

      {/* Menu des chapitres */}
      {showChaptersMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowChaptersMenu(false)}
        >
          <div 
            className={`bg-white rounded-lg shadow-xl w-full ${
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

      {/* [Contenu principal reste identique...] */}

      {/* Contrôle du volume */}
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

      {/* Barre de navigation */}
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
          margin-top: -5px;
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
          margin-top: -5px;
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