    import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { Colors } from '@/constants/theme';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: 'en' as const, label: 'English', flag: '🇬🇧' },
        { code: 'vi' as const, label: 'Tiếng Việt', flag: '🇻🇳' },
    ];

    return (
        <View style={styles.container}>
            {languages.map((lang) => (
                <TouchableOpacity
                    key={lang.code}
                    style={[
                        styles.languageButton,
                        language === lang.code && styles.selectedLanguage,
                    ]}
                    onPress={() => setLanguage(lang.code)}
                >
                    <View style={styles.languageContent}>
                        <Text style={styles.flag}>{lang.flag}</Text>
                        <Text
                            style={[
                                styles.languageLabel,
                                language === lang.code && styles.selectedText,
                            ]}
                        >
                            {lang.label}
                        </Text>
                    </View>
                    {language === lang.code && (
                        <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.light.card,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedLanguage: {
        borderColor: Colors.light.primary,
        backgroundColor: '#EEF2FF',
    },
    languageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flag: {
        fontSize: 28,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    selectedText: {
        color: Colors.light.primary,
        fontWeight: '600',
    },
});
