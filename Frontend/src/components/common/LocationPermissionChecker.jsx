// Location Permission Checker Component for Homster
import React, { useState, useEffect } from 'react';
import LocationAccessModal from './LocationAccessModal';

export const LocationPermissionChecker = () => {
    const [showModal, setShowModal] = useState(false);
    const [userType, setUserType] = useState('user');

    useEffect(() => {
        // ... previous user logic ...
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const vendorData = JSON.parse(localStorage.getItem('vendorData') || '{}');
        const workerData = JSON.parse(localStorage.getItem('workerData') || '{}');

        let type = 'user';
        if (vendorData._id || vendorData.id) type = 'vendor';
        else if (workerData._id || workerData.id) type = 'worker';
        setUserType(type);

        const checkPermission = async (isManualTrigger = false) => {
            if (!navigator.permissions) {
                if (isManualTrigger) setShowModal(true);
                return;
            }

            try {
                const status = await navigator.permissions.query({ name: 'geolocation' });

                if (status.state === 'denied' || status.state === 'prompt') {
                    // Show if denied or prompt state, especially on manual trigger
                    setShowModal(true);
                } else if (status.state === 'granted' && isManualTrigger) {
                    // If already granted but user triggered this, they might be having GPS issues
                    // We can try to get location once to see if it works
                    navigator.geolocation.getCurrentPosition(
                        (pos) => window.dispatchEvent(new CustomEvent('locationUpdate', { detail: { lat: pos.coords.latitude, lng: pos.coords.longitude } })),
                        () => setShowModal(true) // If it fails (GPS off), show modal
                    );
                }

                status.onchange = () => {
                    if (status.state === 'granted') setShowModal(false);
                };
            } catch (error) {
                if (isManualTrigger) setShowModal(true);
            }
        };

        // Automatic check on mount
        checkPermission(false);

        // Global listener for manual triggers
        const handleManualTrigger = () => checkPermission(true);
        window.addEventListener('requestLocationPrompt', handleManualTrigger);

        return () => {
            window.removeEventListener('requestLocationPrompt', handleManualTrigger);
        };
    }, []);


    const handleSuccess = (coords) => {
        console.log('Location granted:', coords);
        // You can dispatch a global event or update context here
        window.dispatchEvent(new CustomEvent('locationUpdate', { detail: coords }));
    };

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <LocationAccessModal
            isOpen={showModal}
            onClose={handleClose}
            onSuccess={handleSuccess}
            userType={userType}
        />
    );
};
