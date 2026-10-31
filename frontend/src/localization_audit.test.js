import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, RTL_LANGUAGES } from './i18n/languageConfig';

// Import all 20 locale dictionaries
import en from './i18n/locales/en.json';
import hi from './i18n/locales/hi.json';
import bn from './i18n/locales/bn.json';
import te from './i18n/locales/te.json';
import mr from './i18n/locales/mr.json';
import ta from './i18n/locales/ta.json';
import gu from './i18n/locales/gu.json';
import kn from './i18n/locales/kn.json';
import ml from './i18n/locales/ml.json';
import pa from './i18n/locales/pa.json';
import or from './i18n/locales/or.json';
import as from './i18n/locales/as.json';
import ur from './i18n/locales/ur.json';
import sa from './i18n/locales/sa.json';
import ne from './i18n/locales/ne.json';
import kok from './i18n/locales/kok.json';
import ks from './i18n/locales/ks.json';
import mai from './i18n/locales/mai.json';
import sd from './i18n/locales/sd.json';
import mni from './i18n/locales/mni.json';

const LOCALES = {
  en, hi, bn, te, mr, ta, gu, kn, ml, pa,
  or, as, ur, sa, ne, kok, ks, mai, sd, mni
};

function flatten(obj, prefix = '') {
  let res = {};
  for (let k in obj) {
    let pk = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(res, flatten(obj[k], pk));
    } else {
      res[pk] = obj[k];
    }
  }
  return res;
}

const flatEn = flatten(en);
const enKeys = Object.keys(flatEn);

describe('DisasterChain Website-Wide Localization Audit', () => {
  test('exactly 20 languages are officially supported', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(20);
    expect(DEFAULT_LANGUAGE).toBe('en');
    expect(RTL_LANGUAGES).toContain('ur');
    expect(RTL_LANGUAGES).toContain('ks');
    expect(RTL_LANGUAGES).toContain('sd');
  });

  test('en locale has extensive dictionary coverage', () => {
    expect(enKeys.length).toBeGreaterThanOrEqual(1500);
  });

  SUPPORTED_LANGUAGES.forEach((lang) => {
    describe(`Locale: ${lang.code} (${lang.name})`, () => {
      const loc = LOCALES[lang.code];
      const flatLoc = flatten(loc);
      const locKeys = Object.keys(flatLoc);

      test('locale dictionary exists and has exact key count as English', () => {
        expect(loc).toBeDefined();
        expect(locKeys.length).toBe(enKeys.length);
      });

      test('has 100% key parity with en.json (0 missing keys)', () => {
        const missingKeys = enKeys.filter((k) => !(k in flatLoc));
        expect(missingKeys).toEqual([]);
      });

      test('has 0 extra unmapped keys compared to en.json', () => {
        const extraKeys = locKeys.filter((k) => !(k in flatEn));
        expect(extraKeys).toEqual([]);
      });

      test('contains no empty or null translation values', () => {
        const emptyKeys = locKeys.filter((k) => {
          const val = flatLoc[k];
          return val === '' || val === null || val === undefined;
        });
        expect(emptyKeys).toEqual([]);
      });

      test('critical module roots exist (nav, weather, offline, academy, auth, verification)', () => {
        expect(loc.nav).toBeDefined();
        expect(loc.weather).toBeDefined();
        expect(loc.offline).toBeDefined();
        expect(loc.academy).toBeDefined();
        expect(loc.auth).toBeDefined();
        expect(loc.verification).toBeDefined();
        expect(loc.common).toBeDefined();
      });
    });
  });
});

