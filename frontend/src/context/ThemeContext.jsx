import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const themeTokens = {
  light: {
    bgColor: '#f3f6fb',
    textColor: '#132238',
    navBg: 'rgba(255, 255, 255, 0.82)',
    borderColor: 'rgba(19, 34, 56, 0.12)',
    hoverBg: 'rgba(19, 34, 56, 0.06)',
    toggleBg: 'rgba(19, 34, 56, 0.04)',
    navShadow: '0 12px 30px rgba(19, 34, 56, 0.08)',
    primaryColor: '#7c3aed',
    secondaryColor: '#db2777',
    textColorLight: '#555',
    cardBackground: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    hoverShadow: 'rgba(0, 0, 0, 0.15)',
    gradientStart: '#f8fafc',
    gradientEnd: '#6A82FB',
  },
  dark: {
    bgColor: '#09111f',
    textColor: '#eff4ff',
    navBg: 'rgba(11, 18, 32, 0.85)',
    borderColor: 'rgba(239, 244, 255, 0.14)',
    hoverBg: 'rgba(239, 244, 255, 0.08)',
    toggleBg: 'rgba(239, 244, 255, 0.06)',
    navShadow: '0 12px 30px rgba(0, 0, 0, 0.28)',
    primaryColor: '#7B68EE',
    secondaryColor: '#00BFFF',
    textColorLight: '#B0B0B0',
    cardBackground: '#2E2E4A',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    hoverShadow: 'rgba(0, 0, 0, 0.5)',
    gradientStart: '#1A1A2E',
    gradientEnd: '#3A3A5A',
  },
}

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = localStorage.getItem('theme')

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    const tokens = themeTokens[theme]

    root.dataset.theme = theme
    root.style.setProperty('--bg-color', tokens.bgColor)
    root.style.setProperty('--text-color', tokens.textColor)
    root.style.setProperty('--nav-bg', tokens.navBg)
    root.style.setProperty('--border-color', tokens.borderColor)
    root.style.setProperty('--hover-bg', tokens.hoverBg)
    root.style.setProperty('--toggle-bg', tokens.toggleBg)
    root.style.setProperty('--nav-shadow', tokens.navShadow)
    root.style.setProperty('--primary-color', tokens.primaryColor)
    root.style.setProperty('--secondary-color', tokens.secondaryColor)
    root.style.setProperty('--text-color-light', tokens.textColorLight)
    root.style.setProperty('--card-background', tokens.cardBackground)
    root.style.setProperty('--shadow-color', tokens.shadowColor)
    root.style.setProperty('--hover-shadow', tokens.hoverShadow)
    root.style.setProperty('--gradient-start', tokens.gradientStart)
    root.style.setProperty('--gradient-end', tokens.gradientEnd)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    themeTokens,
    themeStyles: themeTokens[theme],
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}