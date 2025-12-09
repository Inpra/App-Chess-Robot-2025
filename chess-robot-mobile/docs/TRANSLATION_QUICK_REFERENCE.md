# Quick Translation Reference

## 🚀 Quick Start

### 1. Import the hook
```tsx
import { useLanguage } from '@/context/LanguageContext';
```

### 2. Use in component
```tsx
export default function MyScreen() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <View>
      <Text>{t('welcome')}</Text>
    </View>
  );
}
```

## 📚 Common Translation Keys

### Authentication
- `login` - Login / Đăng nhập
- `logout` - Logout / Đăng xuất
- `register` - Register / Đăng ký
- `email` - Email
- `password` - Password / Mật khẩu
- `username` - Username / Tên đăng nhập

### Common Actions
- `save` - Save / Lưu
- `cancel` - Cancel / Hủy
- `update` - Update / Cập nhật
- `delete` - Delete / Xóa
- `confirm` - Confirm / Xác nhận
- `loading` - Loading... / Đang tải...

### Alerts
- `error` - Error / Lỗi
- `success` - Success / Thành công
- `logoutConfirm` - Are you sure you want to logout? / Bạn có chắc chắn muốn đăng xuất?

### Profile
- `profile` - Profile / Hồ sơ
- `editProfile` - Edit Profile / Chỉnh sửa hồ sơ
- `personalInfo` - Personal Information / Thông tin cá nhân
- `securityAndPassword` - Security & Password / Bảo mật & Mật khẩu

### Settings
- `settings` - Settings / Cài đặt
- `darkMode` - Dark Mode / Chế độ tối
- `notifications` - Notifications / Thông báo
- `language` - Language / Ngôn ngữ

### Game
- `game` - Game / Trò chơi
- `vsBot` - VS Bot / Đấu với Bot
- `puzzle` - Puzzle / Giải đố
- `startGame` - Start Game / Bắt đầu
- `youWin` - You Win! / Bạn thắng!
- `youLose` - You Lose! / Bạn thua!

## 🔧 Advanced Usage

### Change Language Programmatically
```tsx
const { setLanguage } = useLanguage();

// Switch to English
await setLanguage('en');

// Switch to Vietnamese
await setLanguage('vi');
```

### Check Current Language
```tsx
const { language } = useLanguage();

if (language === 'en') {
  // Do something for English
} else {
  // Do something for Vietnamese
}
```

### Use in Alert
```tsx
Alert.alert(
  t('error'),
  t('cannotLoadUser'),
  [
    { text: t('cancel'), style: 'cancel' },
    { text: t('confirm'), onPress: handleConfirm }
  ]
);
```

### Use in Placeholders
```tsx
<TextInput
  placeholder={t('enterEmailPlaceholder')}
  value={email}
  onChangeText={setEmail}
/>
```

## ➕ Adding New Translations

1. Open `constants/translations.ts`
2. Add to both `en` and `vi`:

```typescript
export const translations = {
  en: {
    // ... existing
    myNewKey: 'My English Text',
  },
  vi: {
    // ... existing
    myNewKey: 'Văn bản tiếng Việt',
  },
};
```

3. Use immediately:
```tsx
<Text>{t('myNewKey')}</Text>
```

## 💡 Tips

- ✅ Always add translations to BOTH languages
- ✅ Use descriptive key names (e.g., `enterEmailPlaceholder` not `placeholder1`)
- ✅ Group related keys together
- ✅ TypeScript will autocomplete available keys
- ✅ If a key is missing, it will return the key itself

## 📋 Full Key List

See `constants/translations.ts` for the complete list of 78+ available translation keys.
