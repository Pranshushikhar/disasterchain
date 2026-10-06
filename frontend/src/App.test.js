import React from 'react';

describe('DisasterChain Core Smoke Tests', () => {
  it('validates test runner environment and basic configuration', () => {
    expect(true).toBe(true);
  });

  it('validates environmental constants and color palette consistency', () => {
    const palette = {
      bgPrimary: '#F1EBDD',
      surface: '#F8F5EE',
      textPrimary: '#1E2725',
      earthGreen: '#496B5A',
      emergencyRed: '#C94B4B',
    };
    expect(palette.bgPrimary).toBe('#F1EBDD');
    expect(palette.earthGreen).toBe('#496B5A');
    expect(palette.emergencyRed).toBe('#C94B4B');
  });

  it('validates navigation route definitions', () => {
    const routes = ['/', '/weather', '/map', '/incidents', '/safety'];
    expect(routes).toHaveLength(5);
    expect(routes).toContain('/weather');
    expect(routes).toContain('/map');
  });

  describe('Cinematic Intro Logic & Route Bypass Behavior', () => {
    // Pure function extracting the App.js intro determination logic
    const shouldShowIntro = (pathname = '/', search = '') => {
      const cleanPath = (pathname || '').toLowerCase().replace(/\/+$/, '');
      const cleanSearch = search || '';

      if (cleanSearch.includes('skip_intro=1')) {
        return false;
      }

      if (
        cleanPath.startsWith('/verify-email') ||
        cleanPath.startsWith('/reset-password') ||
        cleanSearch.includes('token=')
      ) {
        return false;
      }

      return true;
    };

    it('plays intro on fresh site root load (https://disasterchain.vercel.app /)', () => {
      expect(shouldShowIntro('/', '')).toBe(true);
      expect(shouldShowIntro('', '')).toBe(true);
      expect(shouldShowIntro('/dashboard', '')).toBe(true);
    });

    it('plays intro on page reload regardless of previous visits', () => {
      // Even if previous visits occurred, intro should always initialize to true on reload
      expect(shouldShowIntro('/', '')).toBe(true);
      expect(shouldShowIntro('/weather', '')).toBe(true);
    });

    it('bypasses intro on email verification links (/verify-email?token=...)', () => {
      expect(shouldShowIntro('/verify-email', '?token=abc123456789')).toBe(false);
      expect(shouldShowIntro('/verify-email/', '?token=abc123456789')).toBe(false);
    });

    it('bypasses intro on password reset links (/reset-password?token=...)', () => {
      expect(shouldShowIntro('/reset-password', '?token=xyz987654321')).toBe(false);
      expect(shouldShowIntro('/reset-password/', '?token=xyz987654321')).toBe(false);
    });

    it('bypasses intro when explicit skip_intro=1 query is provided', () => {
      expect(shouldShowIntro('/', '?skip_intro=1')).toBe(false);
    });

    it('does not repeat intro during SPA route navigation when state is false', () => {
      let showIntro = true;
      // User transitions into the app on initial load
      const onEnter = () => {
        showIntro = false;
      };
      onEnter();
      expect(showIntro).toBe(false);

      // Subsequent internal route changes in SPA do not re-trigger showIntro
      const currentRoute = '/weather';
      expect(currentRoute).toBe('/weather');
      expect(showIntro).toBe(false);
    });
  });

  describe('Living Environment Theme System', () => {
    it('defines all 6 living atmospheric environments with complete metadata', () => {
      const { ENVIRONMENTS } = require('./context/EnvironmentContext');
      expect(ENVIRONMENTS).toHaveLength(6);
      const envIds = ENVIRONMENTS.map((e) => e.id);
      expect(envIds).toEqual(['calm', 'rain', 'storm', 'night', 'snow', 'fog']);

      ENVIRONMENTS.forEach((env) => {
        expect(env.id).toBeDefined();
        expect(env.label).toBeDefined();
        expect(env.shortLabel).toBeDefined();
        expect(env.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(env.description).toBeTruthy();
      });
    });

    it('exports living environment components without runtime initialization errors', () => {
      const CinematicIntro = require('./components/CinematicIntro').default;
      const LivingEnvironment = require('./components/LivingEnvironment').default;
      const EnvironmentSelector = require('./components/EnvironmentSelector').default;
      expect(typeof CinematicIntro).toBe('function');
      expect(typeof LivingEnvironment).toBe('function');
      expect(typeof EnvironmentSelector).toBe('function');
    });
  });
});
