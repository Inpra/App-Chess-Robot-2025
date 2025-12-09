# Internationalization (i18n) Guide

## Overview
The mobile app now supports multiple languages (English and Vietnamese) using a custom i18n system.

## How It Works

### 1. Translation Files
All translations are stored in `constants/translations.ts`:
- `translations.en` - English translations
- `translations.vi` - Vietnamese translations

### 2. Language Context
The `LanguageContext` (`context/LanguageContext.tsx`) provides:
- `language`: Current language ('en' or 'vi')
- `setLanguage(lang)`: Function to change language
- `t(key)`: Translation function

### 3. Root Layout
The `app/_layout.tsx` wraps the entire app with `LanguageProvider`.

## Usage in Components

### Import the hook:
```tsx
import { useLanguage } from '@/context/LanguageContext';
```

### Use in component:
```tsx
export default function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Button 
        title={t('login')} 
        onPress={() => {/* ... */}} 
      />
    </View>
  );
}
```

### Change Language:
```tsx
// Switch to English
await setLanguage('en');

// Switch to Vietnamese  
await setLanguage('vi');
```

## Adding New Translations

1. Open `constants/translations.ts`
2. Add the key to both `en` and `vi` objects:

```typescript
export const translations = {
  en: {
    // ... existing translations
    myNewKey: 'My New Text',
  },
  vi: {
    // ... existing translations
    myNewKey: 'Văn bản mới của tôi',
  },
};
```

3. Use in component:
```tsx
<Text>{t('myNewKey')}</Text>
```

## Current Status

### ✅ Completed
- [x] Translation system setup
- [x] Language Context provider
- [x] Root layout with LanguageProvider
- [x] ProfileScreen fully translated
- [x] Default language set to English

### 🔄 To Do
The following screens still need to be updated to use the translation system:
- [ ] SecurityScreen
- [ ] EditProfileScreen
- [ ] GameOverModal
- [ ] VsBotScreen
- [ ] TutorialScreen
- [ ] Login/Register screens
- [ ] Match History
- [ ] Ranking
- [ ] FAQ
- [ ] All other screens

## Example: ProfileScreen

The ProfileScreen has been fully updated to use translations. Check `components/profile/ProfileScreen.tsx` for reference on how to:
- Use `t()` function for all text
- Handle Alert messages
- Use translations in props
- Dynamic text rendering

## Notes

- The app defaults to **English** on first launch
- Language preference is saved in AsyncStorage
- Language persists across app restarts
- TypeScript provides autocomplete for translation keys
