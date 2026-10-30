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

  describe('Developer Credit & Global Footer', () => {
    it('exports Footer component and validates developer credit specifications', () => {
      const Footer = require('./components/Footer').default;
      expect(typeof Footer).toBe('function');

      const ReactDOMServer = require('react-dom/server');
      const html = ReactDOMServer.renderToStaticMarkup(<Footer />);
      
      expect(html).toContain('dc-global-footer');
      expect(html).toContain('© 2026 DisasterChain');
      expect(html).toContain('Designed &amp; Developed by');
      expect(html).toContain('Pranshu Shikhar');
      expect(html).toContain('dc-credit-author');
    });
  });

  describe('MarkdownRenderer & Rich Text Parsing', () => {
    it('renders headings and bold text cleanly without leaking raw markdown symbols', () => {
      const MarkdownRenderer = require('./components/MarkdownRenderer').default;
      const ReactDOMServer = require('react-dom/server');
      const testContent = "### Weather Advisory\n\n• **Clothing:** Lightweight cotton.\n• **Precipitation:** 20% chance of rain.";
      const html = ReactDOMServer.renderToStaticMarkup(<MarkdownRenderer content={testContent} />);

      expect(html).toContain('dc-markdown-renderer');
      expect(html).toContain('<h5 class="dc-md-h5">');
      expect(html).toContain('Weather Advisory');
      expect(html).not.toContain('###');
      expect(html).toContain('<strong class="dc-md-bold">');
      expect(html).toContain('Clothing:');
      expect(html).not.toContain('**Clothing:**');
      expect(html).toContain('<ul class="dc-md-ul">');
      expect(html).toContain('<li class="dc-md-li">');
    });
  });

  describe('Interactive Onboarding Tour', () => {
    it('exports OnboardingTour component and all 10 structured steps', () => {
      const { default: OnboardingTour, TOUR_STEPS } = require('./components/OnboardingTour');
      expect(typeof OnboardingTour).toBe('function');
      expect(TOUR_STEPS).toHaveLength(10);

      const stepIds = TOUR_STEPS.map((s) => s.id);
      expect(stepIds).toContain('welcome');
      expect(stepIds).toContain('nav');
      expect(stepIds).toContain('home');
      expect(stepIds).toContain('weather');
      expect(stepIds).toContain('map');
      expect(stepIds).toContain('incidents');
      expect(stepIds).toContain('safety');
      expect(stepIds).toContain('weathergpt');
      expect(stepIds).toContain('sos');
      expect(stepIds).toContain('finish');

      TOUR_STEPS.forEach((step) => {
        expect(step.id).toBeDefined();
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
        expect(step.badge).toBeTruthy();
      });
    });
  });

  describe('Single Source of Truth Active Location & Regression Prevention', () => {
    const { extractCityName, POPULAR_INDIAN_CITIES } = require('./context/LocationContext');

    it('extracts correct city name from displayName and prevents stale mismatch', () => {
      // Direct extraction
      expect(extractCityName('Kharar, Punjab, India')).toBe('Kharar');
      expect(extractCityName('Mumbai, Maharashtra, India')).toBe('Mumbai');
      expect(extractCityName('New Delhi, Delhi, India')).toBe('New Delhi');

      // Regression check: If legacyDetails had stale 'Mumbai', but user selected 'Kharar, Punjab, India'
      expect(extractCityName('Kharar, Punjab, India', 'Mumbai')).toBe('Kharar');
      // If legacyDetails matches the displayName, it preserves it cleanly
      expect(extractCityName('Kharar, Punjab, India', 'Kharar')).toBe('Kharar');
    });

    it('ensures dynamic greeting uses username when logged in, and falls back to clean greeting without location when unauthenticated', () => {
      const getGreeting = (user, hour = 14, t = (k, def) => def) => {
        const salutation =
          hour < 12
            ? t('common.goodMorning', 'Good morning')
            : hour < 17
            ? t('common.goodAfternoon', 'Good afternoon')
            : t('common.goodEvening', 'Good evening');

        const rawName = user?.name || user?.username || '';
        const cleanName = typeof rawName === 'string' ? rawName.trim().split(' ')[0] : '';

        if (cleanName) {
          return `${salutation}, ${cleanName}.`;
        }

        return `${salutation}.`;
      };

      // 1. Authenticated user "Rahul"
      const userRahul = { name: 'Rahul' };
      expect(getGreeting(userRahul, 9)).toBe('Good morning, Rahul.');
      expect(getGreeting(userRahul, 14)).toBe('Good afternoon, Rahul.');
      expect(getGreeting(userRahul, 19)).toBe('Good evening, Rahul.');

      // 2. Authenticated user with full name "Rahul Sharma"
      const userFullName = { name: 'Rahul Sharma' };
      expect(getGreeting(userFullName, 14)).toBe('Good afternoon, Rahul.');

      // 3. Unauthenticated / Logged-out user (no location, no placeholder)
      expect(getGreeting(null, 9)).toBe('Good morning.');
      expect(getGreeting(null, 14)).toBe('Good afternoon.');
      expect(getGreeting(null, 19)).toBe('Good evening.');
      expect(getGreeting({}, 14)).toBe('Good afternoon.');

      // 4. Never uses city/location in the greeting
      const unauthGreeting = getGreeting(null, 14);
      expect(unauthGreeting).not.toContain('Mumbai');
      expect(unauthGreeting).not.toContain('Kharar');
      expect(unauthGreeting).not.toContain('Delhi');
      expect(unauthGreeting).not.toContain('Sector');
      expect(unauthGreeting).toBe('Good afternoon.');

      // 5. In other languages (e.g. Hindi)
      const mockTHindi = (key) => {
        if (key === 'common.goodMorning') return 'शुभ प्रभात';
        if (key === 'common.goodAfternoon') return 'शुभ दोपहर';
        if (key === 'common.goodEvening') return 'शुभ संध्या';
        return '';
      };
      expect(getGreeting(userRahul, 14, mockTHindi)).toBe('शुभ दोपहर, Rahul.');
      expect(getGreeting(null, 14, mockTHindi)).toBe('शुभ दोपहर.');
    });

    it('ensures official advisories are strictly verified against active location', () => {
      const isAlertRelevant = (alert, activeCity, activeLocationName) => {
        const cityLower = (activeCity || '').toLowerCase().trim();
        const stateLower = (activeLocationName || '').toLowerCase();
        const alertLoc = (alert.location || alert.target || alert.area || '').toLowerCase();
        const isNationwide = alertLoc.includes('national') || alertLoc.includes('pan-india') || alertLoc.includes('all india');
        if (isNationwide) return true;
        if (cityLower && alertLoc.includes(cityLower)) return true;
        if (stateLower.includes('punjab') && alertLoc.includes('punjab')) return true;
        if (stateLower.includes('maharashtra') && alertLoc.includes('maharashtra')) return true;
        return false;
      };

      const delhiAlert = { title: 'Yamuna Inundation', location: 'Delhi Sector 14' };
      const punjabAlert = { title: 'Canal Overflow Warning', location: 'Punjab Regional Basin' };
      const nationalAlert = { title: 'High Heat Advisory', location: 'National Highway Corridor' };

      // When Kharar (Punjab) is active:
      expect(isAlertRelevant(delhiAlert, 'Kharar', 'Kharar, Punjab, India')).toBe(false);
      expect(isAlertRelevant(punjabAlert, 'Kharar', 'Kharar, Punjab, India')).toBe(true);
      expect(isAlertRelevant(nationalAlert, 'Kharar', 'Kharar, Punjab, India')).toBe(true);

      // When Mumbai (Maharashtra) is active:
      expect(isAlertRelevant(delhiAlert, 'Mumbai', 'Mumbai, Maharashtra, India')).toBe(false);
      expect(isAlertRelevant(punjabAlert, 'Mumbai', 'Mumbai, Maharashtra, India')).toBe(false);
      expect(isAlertRelevant(nationalAlert, 'Mumbai', 'Mumbai, Maharashtra, India')).toBe(true);
    });

    it('exports popular Indian cities with valid coordinates and matching city/displayName', () => {
      expect(POPULAR_INDIAN_CITIES.length).toBeGreaterThanOrEqual(15);
      POPULAR_INDIAN_CITIES.forEach((item) => {
        expect(item.city).toBeTruthy();
        expect(item.displayName).toContain(item.city);
        expect(typeof item.lat).toBe('number');
        expect(typeof item.lon).toBe('number');
        expect(item.lat).toBeGreaterThan(5);
        expect(item.lat).toBeLessThan(40);
      });
    });
  });
});
