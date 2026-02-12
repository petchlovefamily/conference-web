'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

interface QRCodeTicketProps {
    regCode: string;
    eventName?: string;
    size?: number;
    showDownload?: boolean;
    checkinBaseUrl?: string;
}

export function QRCodeTicket({
    regCode,
    eventName,
    size = 200,
    showDownload = true,
    checkinBaseUrl = typeof window !== 'undefined' ? window.location.origin : '',
}: QRCodeTicketProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    // QR Code data contains both regCode and checkin URL
    const qrData = JSON.stringify({
        regCode,
        checkinUrl: `${checkinBaseUrl}/checkin/${regCode}`,
    });

    const handleDownload = useCallback(() => {
        if (!qrRef.current) return;

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        // Convert SVG to canvas then to PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
            canvas.width = size + 40; // padding
            canvas.height = size + (eventName ? 100 : 60); // space for text

            // Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // QR Code
            ctx.drawImage(img, 20, 20, size, size);

            // Text
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';

            if (eventName) {
                ctx.fillText(eventName, canvas.width / 2, size + 40);
            }
            ctx.font = '12px monospace';
            ctx.fillText(regCode, canvas.width / 2, size + (eventName ? 58 : 40));

            // Download
            const link = document.createElement('a');
            link.download = `ticket-${regCode}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }, [regCode, eventName, size]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* QR Code Container */}
            <div
                ref={qrRef}
                className="bg-white p-4 rounded-xl shadow-lg"
            >
                <QRCodeSVG
                    value={qrData}
                    size={size}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                />
            </div>

            {/* Registration Code */}
            <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">รหัสลงทะเบียน</p>
                <p className="font-mono text-lg font-bold text-emerald-400">{regCode}</p>
            </div>

            {/* Download Button */}
            {showDownload && (
                <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                >
                    <Download className="w-4 h-4" />
                    Download QR Code
                </Button>
            )}
        </div>
    );
}

// Compact version for lists
export function QRCodeTicketCompact({
    regCode,
    size = 80,
    onClick,
}: {
    regCode: string;
    size?: number;
    onClick?: () => void;
}) {
    const qrData = JSON.stringify({
        regCode,
        checkinUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/checkin/${regCode}`,
    });

    return (
        <div
            className="bg-white p-2 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
            onClick={onClick}
        >
            <QRCodeSVG
                value={qrData}
                size={size}
                level="M"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
            />
        </div>
    );
}
