'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';

export interface CheckoutData {
    // Step 1: ข้อมูลส่วนตัว
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;

    // Step 2: Package + Add-ons
    selectedPackage: string;
    selectedAddOns: string[];

    // Add-on details
    dietaryRequirement: string;
    dietaryOtherText: string;
    selectedWorkshopTopic?: string;

    // Addon-only mode
    isAddonOnly?: boolean;
    purchasedAddOns?: string[];

    // Step 3: Tax Invoice
    needTaxInvoice: boolean;
    taxName: string;
    taxId: string;
    taxAddress: string;
    taxSubDistrict: string;
    taxDistrict: string;
    taxProvince: string;
    taxPostalCode: string;

    // Step 4: Payment Method
    paymentMethod: 'qr' | 'card';

    // Currency (auto-detect from user.delegateType)
    currency?: 'THB' | 'USD';

    // Promo Code
    promoCode: string;
    promoApplied: boolean;
}

const INITIAL_CHECKOUT_DATA: CheckoutData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    selectedPackage: '',
    selectedAddOns: [],
    dietaryRequirement: '',
    dietaryOtherText: '',
    selectedWorkshopTopic: undefined,
    isAddonOnly: false,
    purchasedAddOns: [],
    needTaxInvoice: false,
    taxName: '',
    taxId: '',
    taxAddress: '',
    taxSubDistrict: '',
    taxDistrict: '',
    taxProvince: '',
    taxPostalCode: '',
    paymentMethod: 'qr',
    currency: 'THB',
    promoCode: '',
    promoApplied: false,
};

const STEPS = [
    { id: 1, label: 'ข้อมูลส่วนตัว' },
    { id: 2, label: 'เลือกแพ็กเกจ' },
    { id: 3, label: 'ใบกำกับภาษี' },
    { id: 4, label: 'วิธีชำระเงิน' },
    { id: 5, label: 'สรุปการสั่งซื้อ' },
] as const;

export function useCheckoutWizard(eventId: string, filter?: (step: typeof STEPS[number]) => boolean) {
    const storageKey = `checkout-wizard-${eventId}`;
    const [currentStep, setCurrentStep] = useState(1);
    const [checkoutData, setCheckoutData] = useState<CheckoutData>(INITIAL_CHECKOUT_DATA);

    const availableSteps = useMemo(() => (filter ? STEPS.filter(filter) : STEPS), [filter]);

    // Restore from sessionStorage on mount
    useEffect(() => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.checkoutData) {
                    setCheckoutData(parsed.checkoutData);
                }
                if (parsed.currentStep) {
                    const isAvailable = availableSteps.some((s: { id: number }) => s.id === parsed.currentStep);
                    setCurrentStep(isAvailable ? parsed.currentStep : availableSteps[0].id);
                }
            }
        } catch {
            // ignore parse errors
        }
    }, [storageKey, availableSteps]);

    // Persist to sessionStorage on change
    useEffect(() => {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({
                checkoutData,
                currentStep,
            }));
        } catch {
            // ignore storage errors
        }
    }, [checkoutData, currentStep, storageKey]);

    const updateCheckoutData = useCallback((updates: Partial<CheckoutData>) => {
        setCheckoutData(prev => ({ ...prev, ...updates }));
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep(prev => {
            const currentIndex = availableSteps.findIndex((s: { id: number }) => s.id === prev);
            if (currentIndex < availableSteps.length - 1) {
                return availableSteps[currentIndex + 1].id;
            }
            return prev;
        });
    }, [availableSteps]);

    const prevStep = useCallback(() => {
        setCurrentStep(prev => {
            const currentIndex = availableSteps.findIndex((s: { id: number }) => s.id === prev);
            if (currentIndex > 0) {
                return availableSteps[currentIndex - 1].id;
            }
            return prev;
        });
    }, [availableSteps]);

    const goToStep = useCallback((step: number) => {
        if (availableSteps.some((s: { id: number }) => s.id === step)) {
            setCurrentStep(step);
        }
    }, [availableSteps]);

    const resetWizard = useCallback(() => {
        setCheckoutData(INITIAL_CHECKOUT_DATA);
        setCurrentStep(1);
        sessionStorage.removeItem(storageKey);
    }, [storageKey]);

    // Validation per step
    const isStep1Valid = useCallback(() => {
        const { firstName, lastName, email, phone } = checkoutData;
        return !!firstName.trim() && !!lastName.trim() && !!email.trim() && !!phone.trim();
    }, [checkoutData]);

    const isStep2Valid = useCallback(() => {
        if (checkoutData.isAddonOnly) {
            return checkoutData.selectedAddOns.length > 0;
        }
        return !!checkoutData.selectedPackage;
    }, [checkoutData]);

    const isStep3Valid = useCallback(() => {
        if (!checkoutData.needTaxInvoice) return true;
        const { taxName, taxId, taxAddress, taxSubDistrict, taxDistrict, taxProvince, taxPostalCode } = checkoutData;
        return !!taxName.trim() && !!taxId.trim() && !!taxAddress.trim() &&
            !!taxSubDistrict.trim() && !!taxDistrict.trim() && !!taxProvince.trim() && !!taxPostalCode.trim();
    }, [checkoutData]);

    const isStep4Valid = useCallback(() => {
        return !!checkoutData.paymentMethod;
    }, [checkoutData]);

    const isStep5Valid = useCallback(() => {
        return true; // Review step is always valid if you reached it
    }, []);

    const isCurrentStepValid = useCallback(() => {
        switch (currentStep) {
            case 1: return isStep1Valid();
            case 2: return isStep2Valid();
            case 3: return isStep3Valid();
            case 4: return isStep4Valid();
            case 5: return isStep5Valid();
            default: return false;
        }
    }, [currentStep, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, isStep5Valid]);

    const canProceedToPayment = useCallback(() => {
        return isStep1Valid() && isStep2Valid() && isStep3Valid() && isStep4Valid() && currentStep === 5;
    }, [isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, currentStep]);

    return {
        currentStep,
        checkoutData,
        steps: availableSteps,
        updateCheckoutData,
        nextStep,
        prevStep,
        goToStep,
        resetWizard,
        isCurrentStepValid,
        canProceedToPayment,
        isStep1Valid,
        isStep2Valid,
        isStep3Valid,
        isStep4Valid,
    };
}
