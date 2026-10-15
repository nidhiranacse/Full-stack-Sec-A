/**
 * Lab Sheet 02 - Task 2.1: Dynamic Interface Styling & Scripting Interactivity
 * Student: Rahul Raj
 * Core JavaScript Operational Element: Theme Toggler Method with LocalStorage State Retention
 */

(function () {
  'use strict';

  // DOM Elements
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const activeThemeText = document.getElementById('active-theme-text');
  const activeTokenBg = document.getElementById('active-token-bg');
  const rootElement = document.documentElement;

  // LocalStorage Key
  const THEME_STORAGE_KEY = 'auracore_preferred_theme';

  /**
   * Determine initial theme from localStorage or system OS preference
   */
  function getInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    // Check OS media query
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Apply theme to DOM and update interactive indicators
   * @param {string} theme - 'dark' or 'light'
   */
  function applyTheme(theme) {
    rootElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const isDark = theme === 'dark';
    
    // Update ARIA attribute
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }

    // Update Text Labels
    if (themeLabel) {
      themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
    }

    // Update Live Inspection Dashboard
    if (activeThemeText) {
      activeThemeText.textContent = theme.toUpperCase();
    }

    if (activeTokenBg) {
      activeTokenBg.textContent = isDark ? '#0b0f19' : '#ffffff';
    }

    console.info(`[AuraCore] Theme successfully updated to: ${theme}`);
  }

  /**
   * Toggler Method
   */
  function toggleTheme() {
    const currentTheme = rootElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // Bind Event Listener
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Listen for System OS Theme Preference Changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only auto-change if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Initialize theme on script execution
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

})();
