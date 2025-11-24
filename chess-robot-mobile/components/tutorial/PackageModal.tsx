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
                    <View style={[styles.modalContent, { maxHeight: dimensions.height * 0.7 }]}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: Colors.light.border,
                            paddingBottom: 12
                        }}>
                            <Text style={styles.modalTitle}>Select Course</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={Colors.light.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={{ maxHeight: dimensions.height * 0.5 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {packages.map((pkg) => (
                                <TouchableOpacity
                                    key={pkg.id}
                                    style={[
                                        styles.packageItem,
                                        selectedPackage === pkg.id && styles.packageItemActive
                                    ]}
                                    onPress={() => onSelectPackage(pkg.id)}
                                >
                                    <View style={[
                                        styles.packageIcon,
                                        selectedPackage === pkg.id && { backgroundColor: Colors.light.primary }
                                    ]}>
                                        <Ionicons
                                            name={pkg.icon as any}
                                            size={24}
                                            color={selectedPackage === pkg.id ? '#FFF' : Colors.light.primary}
                                        />
                                    </View>
                                    <View style={styles.packageInfo}>
                                        <Text style={[
                                            styles.packageName,
                                            selectedPackage === pkg.id && styles.packageNameActive
                                        ]}>{pkg.name}</Text>
                                        <Text style={styles.packageDescription}>{pkg.description}</Text>
                                        <Text style={styles.packageLessonCount}>{pkg.lessons.length} lessons</Text>
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
