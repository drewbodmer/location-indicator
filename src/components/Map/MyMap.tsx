import React, { useState, useEffect, useCallback } from 'react';
import { Map, useControl, NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import { fetchDirections, COLOR_SEVERITY_MAP } from '../../lib/utils';
import type { IControl } from 'mapbox-gl';
import { getUserLocation, getEmergencyLocations, getSafetyAssets } from '@/lib/api/locations';
import type { LineLayerSpecification } from 'mapbox-gl';
import { RouteInfo } from '@/components/Map/RouteInfo';
import { EmergencyOverview, IconData } from '@/components/Emergency/EmergencyOverview';
import { Emergency } from '@/types/Emergency';
import { SafetyAsset } from "@/types/SafetyAsset";
import { getLayers, getSafetyAssetLayers } from './layers';

function DeckGLOverlay(props: any) {
    const overlay = useControl(() => new DeckOverlay(props) as unknown as IControl);
    // @ts-ignore - pulled from the deck.gl docs so we can ignore the type issue
    overlay.setProps(props);
    return null;
}

const initialUserLocation = await getUserLocation();

export function MyMap() {
    const [routeData, setRouteData] = useState<any>(null);
    const [routeInfo, setRouteInfo] = useState<{ duration: number; distance: number }>({ duration: 0, distance: 0 });
    const [userLocation, setUserLocation] = useState<[number, number]>(initialUserLocation);
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);
    const [selectedVictim, setSelectedVictim] = useState<IconData | null>(null);
    const [iconData, setIconData] = useState<IconData[]>([]);
    const [safetyAssets, setSafetyAssets] = useState<SafetyAsset[]>([]);
    const [showSafetyAssets, setShowSafetyAssets] = useState(false);
    const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

    function victimOnClick(info: any, event: any) {
        if (info.object) {
            const iconData = info.object as IconData;
            setSelectedVictim(iconData);
            setPopoverPosition({ x: info.x, y: info.y });
            return true;
        }
        return false;
    }

    const routeLayerStyle: LineLayerSpecification = {
        id: 'route',
        type: 'line',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#ffca28',
            'line-width': 4,
            'line-opacity': 0.75
        },
        source: ''
    };

    useEffect(() => {
        const iconData: IconData[] = emergencies.map((emergency: Emergency) => ({
            id: emergency.id,
            position: emergency.location as [number, number],
            icon: `/assets/${emergency.type}.png`,
            size: 30,
            color: COLOR_SEVERITY_MAP[emergency.severity || "high"],
            info: {
                title: emergency.title,
                type: emergency.type,
                description: emergency.description,
                timestamp: new Date().toLocaleString(),
                severity: emergency.severity
            }
        }))
        setIconData(iconData)
    }, [emergencies])

    const onRouteClose = () => {
        setRouteData(null);
        setRouteInfo({ duration: 0, distance: 0 });
        setShowSafetyAssets(false);
        setSafetyAssets([]);
    }

    const getDirections = async (victimLocation: [number, number]) => {
        const result = await fetchDirections(userLocation, victimLocation);
        if (result) {
            setRouteInfo(result.routeInfo);
            setRouteData(result.routeData);
        }
    };

    useEffect(() => {
        const getUser = async () => {
            const userLocation = await getUserLocation();
            setUserLocation(userLocation);
        }
        const getEmergencies = async () => {
            const emergencyLocations = await getEmergencyLocations()
            setEmergencies(emergencyLocations)
        }
        getUser();
        getEmergencies();
    }, []);

    const handleNavigate = useCallback(async (emergency: Emergency) => {
            await getDirections(emergency.location);
            try {
                const assets = await getSafetyAssets(emergency.id);
                setSafetyAssets(assets || []);
                setShowSafetyAssets(true);
            } catch (error) {
                console.error("Failed to load safety assets:", error);
            }
    }, [getDirections, userLocation]);

    const layers = getLayers(iconData, userLocation, victimOnClick);
    const safetyLayers = showSafetyAssets ? getSafetyAssetLayers(safetyAssets) : [];
    const allLayers = [...layers, ...safetyLayers];

    return (
        <div className="relative w-full h-[100vh]">
            <Map
                initialViewState={{
                    longitude: userLocation[0],
                    latitude: userLocation[1],
                    zoom: 13
                }}
                mapStyle="mapbox://styles/mapbox/dark-v10"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            >
                <DeckGLOverlay layers={allLayers} />
                {routeData && (
                    <Source id="route" type="geojson" data={routeData}>
                        <Layer {...routeLayerStyle} />
                    </Source>
                )}
            </Map>

            {routeInfo.distance > 0 && <RouteInfo duration={routeInfo.duration} distance={routeInfo.distance} position={selectedVictim?.position} onClose={onRouteClose} />}


            {selectedVictim && popoverPosition && (
                <EmergencyOverview
                    icon={selectedVictim}
                    position={popoverPosition}
                    onClose={() => {
                        setPopoverPosition(null);
                    }}
                    emergency={emergencies.find((e) => e.id === selectedVictim.id) as Emergency}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    );
}