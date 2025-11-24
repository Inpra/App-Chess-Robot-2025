import { Colors } from '@/constants/theme';
import { getTutorialStyles } from '@/styles/tutorial.styles';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface Package {
    id: string;
    name: string;
    description: string;
    icon: string;
    lessons: any[];
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
                        <Text style={styles.modalTitle}>Chọn Gói Bài Học</Text>

                        <ScrollView
                            showsVerticalScrollIndicator={true}
                            style={{ maxHeight: dimensions.height * 0.5 }}
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
                                    <View style={styles.packageIcon}>
                                        <Ionicons
                                            name={pkg.icon as any}
                                            size={32}
                                            color={selectedPackage === pkg.id ? Colors.light.primary : Colors.light.icon}
                                        />
                                    </View>
                                    <View style={styles.packageInfo}>
                                        <Text style={[
                                            styles.packageName,
                                            selectedPackage === pkg.id && styles.packageNameActive
                                        ]}>
                                            {pkg.name}
                                        </Text>
                                        <Text style={styles.packageDescription}>{pkg.description}</Text>
                                        <Text style={styles.packageLessonCount}>
                                            {pkg.lessons.length} bài học
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
