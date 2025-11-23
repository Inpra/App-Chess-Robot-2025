import { Colors, Styles } from '@/constants/theme';
import { ScaledSize, StyleSheet } from 'react-native';

export const getDashboardStyles = ({ width, height }: ScaledSize) => {
    const isLandscape = width > height;
    const isTablet = width >= 600; // Common breakpoint for tablets
    const isCompact = !isLandscape && width < 600; // Phone portrait

    // Dynamic sizing based on screen size
    const sidebarWidth = isTablet ? 100 : 80;
    const sidebarHeight = isCompact ? 70 : '100%';
    const contentPadding = isTablet ? 32 : 20;

    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: isCompact ? 'column' : 'row',
            backgroundColor: Colors.light.background,
        },
        sidebar: {
            width: isCompact ? '100%' : sidebarWidth,
            height: sidebarHeight,
            backgroundColor: Colors.light.card,
            flexDirection: isCompact ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: isCompact ? 'space-around' : 'flex-start',
            paddingVertical: isCompact ? 0 : 40,
            borderRightWidth: isCompact ? 0 : 1,
            borderRightColor: Colors.light.border,
            borderTopWidth: isCompact ? 1 : 0,
            borderTopColor: Colors.light.border,
            zIndex: 10,
            // For compact (phone portrait), it sits at the bottom naturally via flex column
        },
        sidebarIcon: {
            marginBottom: isCompact ? 0 : 40,
            padding: 12,
            borderRadius: 16,
        },
        sidebarIconActive: {
            backgroundColor: '#E0E7FF',
        },
        mainContent: {
            flex: 1,
            padding: contentPadding,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isTablet ? 32 : 24,
        },
        headerTitle: {
            fontSize: isTablet ? 32 : 24,
            fontWeight: 'bold',
            color: Colors.light.text,
        },
        headerSubtitle: {
            fontSize: isTablet ? 16 : 14,
            color: Colors.light.icon,
            marginTop: 4,
            display: isCompact ? 'none' : 'flex', // Hide subtitle on small screens if needed
        },
        searchBar: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            paddingHorizontal: isTablet ? 20 : 16,
            paddingVertical: isTablet ? 12 : 8,
            width: isTablet ? 320 : 200,
            ...Styles.shadow,
            display: width < 400 ? 'none' : 'flex', // Hide search on very small screens
        },
        searchInput: {
            marginLeft: 12,
            flex: 1,
            fontSize: isTablet ? 16 : 14,
            color: Colors.light.text,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: isTablet ? 20 : 12,
        },
        notificationBtn: {
            padding: 12,
            backgroundColor: '#FFFFFF',
            borderRadius: 50,
            ...Styles.shadow,
        },
        banner: {
            backgroundColor: Colors.light.primary,
            borderRadius: isTablet ? 32 : 24,
            padding: isTablet ? 40 : 24,
            marginBottom: isTablet ? 32 : 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
            height: isTablet ? 280 : 200,
            ...Styles.shadow,
        },
        bannerContent: {
            flex: 1,
            justifyContent: 'center',
        },
        bannerTag: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginBottom: 16,
        },
        bannerTagText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 'bold',
        },
        bannerTitle: {
            fontSize: isTablet ? 36 : 24,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginBottom: 12,
        },
        bannerText: {
            color: 'rgba(255,255,255,0.9)',
            fontSize: isTablet ? 18 : 14,
            marginBottom: isTablet ? 32 : 16,
            maxWidth: '90%',
        },
        bannerButton: {
            backgroundColor: '#FFFFFF',
            paddingHorizontal: isTablet ? 32 : 20,
            paddingVertical: isTablet ? 16 : 10,
            borderRadius: 16,
            alignSelf: 'flex-start',
        },
        bannerButtonText: {
            color: Colors.light.primary,
            fontWeight: 'bold',
            fontSize: isTablet ? 16 : 14,
        },
        bannerImage: {
            width: isTablet ? 180 : 120,
            height: isTablet ? 180 : 120,
            resizeMode: 'contain',
            position: isCompact ? 'absolute' : 'relative',
            right: isCompact ? -20 : 0,
            bottom: isCompact ? -20 : 0,
            opacity: isCompact ? 0.3 : 1, // Fade image on small screens
        },
        gridContainer: {
            flexDirection: isLandscape ? 'row' : 'column',
            gap: isTablet ? 32 : 24,
        },
        card: {
            ...Styles.card,
            flex: 1,
            padding: isTablet ? 24 : 20,
            borderRadius: 24,
            ...Styles.shadow,
        },
        cardTitle: {
            fontSize: isTablet ? 22 : 18,
            fontWeight: 'bold',
            color: Colors.light.text,
            marginBottom: isTablet ? 24 : 16,
        },
        quickPlayGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: isTablet ? 16 : 12,
            justifyContent: 'space-between',
        },
        quickPlayItem: {
            width: '47%',
            aspectRatio: 1.2,
            backgroundColor: '#F8FAFC',
            padding: 16,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        quickPlayText: {
            marginTop: 12,
            fontWeight: '600',
            fontSize: isTablet ? 16 : 14,
            color: Colors.light.text,
        },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: isTablet ? 32 : 20,
            paddingHorizontal: 12,
        },
        statItem: {
            alignItems: 'center',
        },
        statValue: {
            fontSize: isTablet ? 28 : 22,
            fontWeight: 'bold',
            color: Colors.light.text,
        },
        statLabel: {
            fontSize: 14,
            color: Colors.light.icon,
            marginTop: 4,
        },
        rankingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: isTablet ? 16 : 12,
            borderBottomWidth: 1,
            borderBottomColor: '#F1F5F9',
        },
        rankNumber: {
            width: isTablet ? 32 : 24,
            fontSize: isTablet ? 16 : 14,
            fontWeight: 'bold',
            color: Colors.light.icon,
        },
        rankAvatar: {
            width: isTablet ? 40 : 32,
            height: isTablet ? 40 : 32,
            borderRadius: 20,
            backgroundColor: '#E2E8F0',
            marginRight: isTablet ? 16 : 12,
        },
        rankName: {
            flex: 1,
            fontSize: isTablet ? 16 : 14,
            fontWeight: '600',
            color: Colors.light.text,
        },
        rankScore: {
            fontSize: isTablet ? 16 : 14,
            fontWeight: 'bold',
            color: Colors.light.primary,
        },
    });
};
