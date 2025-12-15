import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { router, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';
import api from '@/lib/api';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

type ScanMode = 'checkin' | 'checkout';

interface QRData {
    type: 'HOTEL_CHECKIN' | 'HOTEL_CHECKOUT';
    hotelId: string;
    hotelName?: string;
}

export default function QRScannerScreen() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [permission, requestPermission] = useCameraPermissions();
    const [mode, setMode] = useState<ScanMode>('checkin');
    const [scanning, setScanning] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        booking?: {
            id: string;
            hotelName: string;
            roomName: string;
            checkIn: string;
            checkOut: string;
        };
    } | null>(null);

    const lastScannedRef = useRef<string | null>(null);

    // Reset scanning when mode changes
    useEffect(() => {
        setScanning(true);
        setResult(null);
        lastScannedRef.current = null;
    }, [mode]);

    const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
        // Prevent duplicate scans
        if (!scanning || processing || data === lastScannedRef.current) return;

        lastScannedRef.current = data;
        setScanning(false);
        setProcessing(true);

        // Haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Parse QR code data
            const qrData: QRData = JSON.parse(data);

            // Validate QR code type
            if (qrData.type !== 'HOTEL_CHECKIN' && qrData.type !== 'HOTEL_CHECKOUT') {
                setResult({
                    success: false,
                    message: t('qrScanner.invalidQR'),
                });
                setProcessing(false);
                return;
            }

            if (!qrData.hotelId) {
                setResult({
                    success: false,
                    message: t('qrScanner.invalidQR'),
                });
                setProcessing(false);
                return;
            }

            // Call the API
            const response = await api.selfCheckIn(qrData.hotelId, mode);

            if (response.data?.success && response.data?.booking) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setResult({
                    success: true,
                    message: mode === 'checkin'
                        ? t('qrScanner.checkedIn')
                        : t('qrScanner.checkedOut'),
                    booking: response.data.booking,
                });
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setResult({
                    success: false,
                    message: response.data?.error || response.error || t('qrScanner.error'),
                });
            }
        } catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setResult({
                success: false,
                message: t('qrScanner.invalidQR'),
            });
        }

        setProcessing(false);
    };

    const handleScanAgain = () => {
        setResult(null);
        setScanning(true);
        lastScannedRef.current = null;
    };

    const handleViewBookings = () => {
        router.replace('/(tabs)/bookings');
    };

    // Permission not determined yet
    if (!permission) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg">{t('common.loading')}</Text>
            </View>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <>
                <Stack.Screen
                    options={{
                        title: t('qrScanner.title'),
                        headerStyle: { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
                        headerTintColor: isDark ? '#FFFFFF' : '#1F2937',
                    }}
                />
                <View className="flex-1 bg-gray-100 dark:bg-gray-900 items-center justify-center p-8">
                    <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center shadow-lg w-full max-w-sm">
                        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
                            <FontAwesome name="camera" size={40} color="#E63946" />
                        </View>
                        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
                            {t('qrScanner.permissionTitle')}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-center mb-6 leading-6">
                            {t('qrScanner.permissionMessage')}
                        </Text>
                        <TouchableOpacity
                            onPress={requestPermission}
                            className="bg-primary py-4 px-8 rounded-xl w-full"
                            activeOpacity={0.8}
                        >
                            <Text className="text-white font-bold text-center text-base">
                                {t('qrScanner.grantPermission')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: t('qrScanner.title'),
                    headerStyle: { backgroundColor: '#000000' },
                    headerTintColor: '#FFFFFF',
                    headerTransparent: true,
                }}
            />
            <View className="flex-1 bg-black">
                {/* Camera View */}
                {scanning && !result && (
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                        onBarcodeScanned={handleBarCodeScanned}
                    />
                )}

                {/* Overlay */}
                <View style={StyleSheet.absoluteFillObject} className="items-center justify-center">
                    {/* Mode Selector (Top) */}
                    <View className="absolute top-28 left-0 right-0 items-center z-10">
                        <View className="flex-row bg-black/50 rounded-full p-1">
                            <TouchableOpacity
                                onPress={() => setMode('checkin')}
                                className={`px-6 py-3 rounded-full ${mode === 'checkin' ? 'bg-primary' : 'bg-transparent'}`}
                                activeOpacity={0.8}
                            >
                                <Text className={`font-semibold ${mode === 'checkin' ? 'text-white' : 'text-gray-300'}`}>
                                    {t('qrScanner.checkIn')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode('checkout')}
                                className={`px-6 py-3 rounded-full ${mode === 'checkout' ? 'bg-primary' : 'bg-transparent'}`}
                                activeOpacity={0.8}
                            >
                                <Text className={`font-semibold ${mode === 'checkout' ? 'text-white' : 'text-gray-300'}`}>
                                    {t('qrScanner.checkOut')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Scanning Area with corners */}
                    {!result && (
                        <>
                            {/* Dark overlay with cutout */}
                            <View
                                style={[
                                    styles.scanAreaContainer,
                                    { width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE }
                                ]}
                            >
                                {/* Corner decorations */}
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                            </View>

                            {/* Instructions */}
                            <View className="absolute bottom-32 left-0 right-0 items-center">
                                <Text className="text-white text-lg font-medium text-center mb-2">
                                    {processing ? t('qrScanner.processing') : t('qrScanner.scanning')}
                                </Text>
                                <Text className="text-gray-400 text-sm text-center px-8">
                                    {t('qrScanner.subtitle')}
                                </Text>
                            </View>
                        </>
                    )}

                    {/* Result View */}
                    {result && (
                        <View className="absolute inset-x-6 bg-white dark:bg-gray-800 rounded-3xl p-8 items-center shadow-2xl">
                            {/* Success/Error Icon */}
                            <View
                                className={`w-20 h-20 rounded-full items-center justify-center mb-6 ${result.success ? 'bg-green-100' : 'bg-red-100'
                                    }`}
                            >
                                <FontAwesome
                                    name={result.success ? 'check' : 'times'}
                                    size={40}
                                    color={result.success ? '#10B981' : '#EF4444'}
                                />
                            </View>

                            {/* Message */}
                            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                                {result.success ? t('qrScanner.success') : t('common.error')}
                            </Text>
                            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
                                {result.message}
                            </Text>

                            {/* Booking Details (if success) */}
                            {result.success && result.booking && (
                                <View className="w-full bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-6">
                                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        {result.booking.hotelName}
                                    </Text>
                                    <Text className="text-gray-500 dark:text-gray-400 mb-2">
                                        {result.booking.roomName}
                                    </Text>
                                    <View className="flex-row gap-4">
                                        <View className="flex-1">
                                            <Text className="text-xs text-gray-400 uppercase mb-1">
                                                {t('bookings.checkIn')}
                                            </Text>
                                            <Text className="text-sm font-medium text-gray-900 dark:text-white">
                                                {new Date(result.booking.checkIn).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-xs text-gray-400 uppercase mb-1">
                                                {t('bookings.checkOut')}
                                            </Text>
                                            <Text className="text-sm font-medium text-gray-900 dark:text-white">
                                                {new Date(result.booking.checkOut).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View className="w-full gap-3">
                                {result.success ? (
                                    <TouchableOpacity
                                        onPress={handleViewBookings}
                                        className="bg-primary py-4 rounded-xl"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white font-bold text-center text-base">
                                            {t('qrScanner.viewBookings')}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleScanAgain}
                                        className="bg-primary py-4 rounded-xl"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white font-bold text-center text-base">
                                            {t('qrScanner.scanAgain')}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    scanAreaContainer: {
        borderRadius: 24,
        borderWidth: 0,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#E63946',
        borderWidth: 4,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
        borderTopLeftRadius: 24,
    },
    topRight: {
        top: 0,
        right: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderTopRightRadius: 24,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomLeftRadius: 24,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomRightRadius: 24,
    },
});
