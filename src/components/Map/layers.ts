import React, { useState, useEffect } from 'react';

import { IconLayer, TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { COLOR_SEVERITY_MAP } from '../../lib/utils';
import { IconData } from '@/components/EmergencyOverview';
import { SafetyAsset } from '@/types/SafetyAsset';

export function getLayers(iconData: IconData[], userLocation: [number, number], victimOnClick: (info: any, event: any) => boolean) {

    const MAX_RIPPLE_SIZE = 150;
    const RIPPLE_EXPAND_RATE = 0.2;

    const ICON_MAPPING: { [key: string]: { x: number; y: number; width: number; height: number; mask: boolean } } = {
        user: { x: 0, y: 0, width: 128, height: 128, mask: true },
        victim: { x: 128, y: 0, width: 128, height: 128, mask: true },
    };

    const [ripples, setRipples] = useState<Array<{ size: number; opacity: number; id: number }>>([
        { size: Math.floor(MAX_RIPPLE_SIZE / 2), opacity: (100 - Math.floor(MAX_RIPPLE_SIZE / 2)) / MAX_RIPPLE_SIZE, id: 1 },
        { size: MAX_RIPPLE_SIZE, opacity: (100 - MAX_RIPPLE_SIZE) / MAX_RIPPLE_SIZE, id: 2 },
    ]);

    useEffect(() => {
        const rippleInterval = setInterval(() => {
            setRipples(currentRipples => {
                const newRipples = currentRipples.map(ripple => {
                    const newSize = ripple.size + RIPPLE_EXPAND_RATE;
                    const newOpacity = ripple.opacity = (MAX_RIPPLE_SIZE - newSize) / MAX_RIPPLE_SIZE;
                    if (newOpacity < 0) {
                        return { size: 0, opacity: 100, id: ripple.id };
                    }
                    return { size: newSize, opacity: newOpacity, id: ripple.id };
                });

                return newRipples;
            });
        }, 10);

        return () => clearInterval(rippleInterval);
    }, []);
    const rippleCircleLayers = ripples.map(ripple =>
        new ScatterplotLayer({
            id: `ripple-circle-${ripple.id}`,
            data: iconData.map((d: IconData) => ({
                position: d.position,
                radius: ripple.size,
                color: d.color || COLOR_SEVERITY_MAP['high']
            })),
            pickable: false,
            stroked: true,
            filled: true,
            opacity: ripple.opacity,
            radiusUnits: 'pixels',
            radiusScale: 0.3,
            getPosition: (d: { position: [number, number] }) => d.position,
            getRadius: (d: { radius: number }) => d.radius,
            getFillColor: (d: { color: number[] }) => d.color as unknown as Uint8Array,
            getLineColor: (d: { color: number[] }) => [d.color[0], d.color[1], d.color[2], 255],
            getLineWidth: 1,
        })
    );

    const layers = [
        ...rippleCircleLayers,
        new IconLayer({
            id: 'user-icon-2',
            data: [{
                position: userLocation,
                icon: 'user',
                size: 50
            }],
            getIcon: (d: IconData) => ({url: "/assets/user.png", width: 32, height: 32}),
            getPosition: (d: { position: [number, number] }) => d.position,
            getSize: (d: { size: number }) => {return 35},
            getColor: [0, 128, 255],
            pickable: false
        }),
        new IconLayer({
            id: 'user-icon',
            data: [{
                position: userLocation,
                icon: 'user',
                size: 50
            }],
            iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
            iconMapping: ICON_MAPPING,
            getIcon: (d: { icon: string }) => d.icon,
            getPosition: (d: { position: [number, number] }) => d.position,
            getSize: (d: { size: number }) => d.size,
            getColor: [0, 128, 255], // Blue for user
            pickable: false
        }),

        // auto-packing icons to save development time https://deck.gl/docs/api-reference/layers/icon-layer#example-auto-packing-iconatlas
        new IconLayer({
            id: 'victim-icon',
            data: iconData,
            getIcon: (d: IconData) => ({ url: d.icon, width: 128, height: 128 }),
            getPosition: (d: IconData) => d.position,
            getSize: (d: IconData) => d.size || 64,
            billboard: false,
            getColor: [255, 255, 255],
            pickable: true,
            onClick(info, event) {
                return victimOnClick(info, event);
            },
        })
    ];

    return layers;
}

export function getSafetyAssetLayers(safetyAssets: SafetyAsset[]) {
    if (!safetyAssets || safetyAssets.length === 0) {
        return [];
    }

    return [
        new IconLayer({
            id: 'safety-asset-icon-layer',
            data: safetyAssets,
            getIcon: (d: SafetyAsset) => {
                switch (d.type) {
                    case 'fire_extinguisher':
                        return { url: "/assets/fire-ext.png", width: 32, height: 32 };
                    case 'first_aid':
                        return { url: "/assets/first-aid.png", width: 32, height: 32 };
                    default:
                        return { url: "/assets/safety.png", width: 32, height: 32 };
                }
            },
            getPosition: (d: SafetyAsset) => d.location,
            getSize: 48,
            getColor: [255, 255, 255],
            pickable: true
        }),

        new TextLayer({
            id: 'safety-asset-text-layer',
            data: safetyAssets,
            getText: (d: SafetyAsset) => d.title,
            getPosition: (d: SafetyAsset) => d.location,
            getSize: 14,
            getAngle: 0,
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            getPixelOffset: [0, -40],
            getColor: [255, 255, 255],
            pickable: false,
        }),
    ];
}