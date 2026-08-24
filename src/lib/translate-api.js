// Live Dynamic Translation API Engine (Powered by Google Translate API)

export const LANG_CODES = {
  English: 'en',
  'Hindi (हिंदी)': 'hi',
  'Marathi (मराठी)': 'mr',
  'Gujarati (ગુજરાતી)': 'gu',
  'Bengali (বাংলা)': 'bn',
  'Tamil (தமிழ்)': 'ta',
  'Telugu (తెలుగు)': 'te',
  'Kannada (ಕನ್ನಡ)': 'kn',
  'Malayalam (മലയാളം)': 'ml',
  'Punjabi (ਪੰਜਾਬੀ)': 'pa',
  'Odia (ଓଡ଼ିଆ)': 'or',
  'Urdu (اردو)': 'ur',
  'Spanish (Español)': 'es',
  'French (Français)': 'fr',
  'German (Deutsch)': 'de',
};

// In-memory Translation Cache to prevent redundant network calls
const translationCache = {};

export async function translateText(text, targetLangCodeOrName = 'hi') {
  if (!text || !text.trim() || targetLangCodeOrName === 'en' || targetLangCodeOrName === 'English') return text;

  const targetLangCode = LANG_CODES[targetLangCodeOrName] || targetLangCodeOrName || 'hi';
  const cacheKey = `${targetLangCode}_${text}`;

  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation API Error');
    const data = await response.json();

    let translatedResult = '';
    if (data && data[0]) {
      translatedResult = data[0].map((item) => item[0]).join('');
    }

    if (translatedResult) {
      translationCache[cacheKey] = translatedResult;
      return translatedResult;
    }
    return text;
  } catch (err) {
    console.warn('Translate API fallback:', err);
    return text;
  }
}

export async function translateTextLive(text, targetLanguageName) {
  return translateText(text, targetLanguageName);
}
