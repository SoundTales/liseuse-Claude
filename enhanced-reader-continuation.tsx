className="px-6 py-2 rounded transition-colors duration-150"
            style={{
              backgroundColor: currentTheme.background,
              border: `1px solid ${currentTheme.accent}`,
              color: currentTheme.text,
            }}
            onClick={() => handleChapterChange(currentChapter + 1)}
            disabled={currentChapter >= 21}
          >
            Suivant →
          </button>
        </div>
      </nav>

      {/* Styles pour le slider de volume */}
      <style>{`
        .volume-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 2px;
          background: ${currentTheme.text};
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
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
          height: 12px;
          width: 12px;
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
      `}</style>
    </div>
  );
};

export default EnhancedReader;