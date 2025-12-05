import { Colors } from '@/constants/theme';
import { getTutorialStyles } from '@/styles/tutorial.styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface Lesson {
    id: number;
    icon: string;
    label: string;
    description?: string;
}

interface Package {
    id: string;
    name: string;
    description: string;
    icon: string;
    lessons: Lesson[];
}

interface PackageModalProps {
    visible: boolean;
    packages: Package[];
    selectedPackage: string | null;
    onClose: () => void;
    onSelectPackage: (packageId: string) => void;
}

export function PackageModal({ visible, packages, selectedPackage, onClose, onSelectPackage }: PackageModalProps) {
    const dimensions = useWindowDimensions();
    const styles = useMemo(() => getTutorialStyles(dimensions), [dimensions]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1}>
                    <View style={[styles.modalContent, { 
                        maxHeight: dimensions.height * 0.85, 
                        maxWidth: 700,
                        minWidth: Math.min(600, dimensions.width * 0.9),
                        paddingHorizontal: 32,
                        paddingVertical: 28
                    }]}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 24,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.light.border,
                            paddingBottom: 16
                        }}>
                            <Text style={[styles.modalTitle, { fontSize: 28, fontWeight: '700' }]}>Select Course</Text>
                            <TouchableOpacity 
                                onPress={onClose}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: Colors.light.border,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Ionicons name="close" size={20} color={Colors.light.icon} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={{ maxHeight: dimensions.height * 0.65 }}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{ paddingBottom: 8 }}
                        >
                            {packages.map((pkg) => (
                                <TouchableOpacity
                                    key={pkg.id}
                                    style={[
                                        styles.packageItem,
                                        selectedPackage === pkg.id && styles.packageItemActive,
                                        { paddingVertical: 20, paddingHorizontal: 20, marginBottom: 16 }
                                    ]}
                                    onPress={() => onSelectPackage(pkg.id)}
                                >
                                    <View style={[
                                        styles.packageIcon,
                                        selectedPackage === pkg.id && { backgroundColor: Colors.light.primary },
                                        { width: 56, height: 56 }
                                    ]}>
                                        <Ionicons
                                            name={pkg.icon as any}
                                            size={32}
                                            color={selectedPackage === pkg.id ? '#FFF' : Colors.light.primary}
                                        />
                                    </View>
                                    <View style={[styles.packageInfo, { flex: 1, paddingLeft: 16 }]}>
                                        <Text style={[
                                            styles.packageName,
                                            selectedPackage === pkg.id && styles.packageNameActive,
                                            { fontSize: 20, fontWeight: '700', marginBottom: 8 }
                                        ]}>{pkg.name}</Text>
                                        <Text style={[styles.packageDescription, { fontSize: 15, lineHeight: 22, marginBottom: 8 }]}>{pkg.description}</Text>
                                        <Text style={[styles.packageLessonCount, { fontSize: 14, fontWeight: '600' }]}>{pkg.lessons.length} lessons</Text>
                                    </View>
                                    {selectedPackage === pkg.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={Colors.light.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
