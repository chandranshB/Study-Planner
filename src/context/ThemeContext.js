import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Color Theme State (default, forest, berry, coffee)
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem('study-flow-color-theme') || 'default';
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('study-flow-dark-mode');
    return saved === 'true';
  });

  // Font Theme State (sans, serif, mono)
  const [fontTheme, setFontTheme] = useState(() => {
    return localStorage.getItem('study-flow-font-theme') || 'sans';
  });

  // Texture Theme State (clean, dots, grid, glass)
  const [textureTheme, setTextureTheme] = useState(() => {
    return localStorage.getItem('study-flow-texture-theme') || 'clean';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Handle Dark Mode
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Handle Color Theme
    body.classList.remove('theme-forest', 'theme-berry', 'theme-coffee');
    if (colorTheme !== 'default') {
      body.classList.add(`theme-${colorTheme}`);
    }

    // Handle Font Theme
    body.classList.remove('font-sans', 'font-serif', 'font-mono');
    body.classList.add(`font-${fontTheme}`);

    // Handle Texture Theme
    body.classList.remove('texture-dots', 'texture-grid', 'texture-glass');
    if (textureTheme !== 'clean') {
      body.classList.add(`texture-${textureTheme}`);
    }

    // Persist
    localStorage.setItem('study-flow-color-theme', colorTheme);
    localStorage.setItem('study-flow-dark-mode', isDarkMode);
    localStorage.setItem('study-flow-font-theme', fontTheme);
    localStorage.setItem('study-flow-texture-theme', textureTheme);
  }, [colorTheme, isDarkMode, fontTheme, textureTheme]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const changeColorTheme = (id) => {
    setColorTheme(id);

    // Apply curated presets for a unique experience
    switch (id) {
      case 'forest':
        setFontTheme('mono');
        setTextureTheme('grid');
        break;
      case 'berry':
        setFontTheme('sans');
        setTextureTheme('glass');
        break;
      case 'coffee':
        setFontTheme('serif');
        setTextureTheme('dots');
        break;
      default: // Blue
        setFontTheme('sans');
        setTextureTheme('clean');
        break;
    }
  };

  const themes = [
    { id: 'default', label: 'Blue (Slate)', color: '#3b82f6' },
    { id: 'forest', label: 'Forest (Zinc)', color: '#10b981' },
    { id: 'berry', label: 'Berry (Neutral)', color: '#f43f5e' },
    { id: 'coffee', label: 'Coffee (Stone)', color: '#f59e0b' },
  ];

  return (
    <ThemeContext.Provider value={{
      colorTheme,
      setColorTheme: changeColorTheme,
      isDarkMode,
      toggleDarkMode,
      fontTheme,
      setFontTheme,
      textureTheme,
      setTextureTheme,
      themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
