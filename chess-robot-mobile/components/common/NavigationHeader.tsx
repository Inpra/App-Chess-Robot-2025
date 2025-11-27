import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavigationHeaderProps {
    title: string;
    onBack?: () => void;
    rightComponent?: React.ReactNode;
    showBackButton?: boolean;
}

export default function NavigationHeader({
    title,
    onBack,
    rightComponent,
    showBackButton = true,
}: NavigationHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={styles.header}>
            {showBackButton ? (
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            ) : (
                <View style={{ width: 40 }} />
            )}
            <Text style={styles.headerTitle}>{title}</Text>
            {rightComponent ? (
                <View style={styles.rightComponent}>{rightComponent}</View>
            ) : (
                <View style={{ width: 40 }} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.light.card,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.light.text,
        flex: 1,
        textAlign: 'center',
    },
    rightComponent: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
