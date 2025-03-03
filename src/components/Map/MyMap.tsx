import React, { useState, useEffect } from 'react';
import { Map, useControl, NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';
import { fetchDirections, COLOR_SEVERITY_MAP } from '../../lib/utils';
import type { IControl } from 'mapbox-gl';
import { getUserLocation, getEmergencyLocations } from '@/lib/api/locations';
import type { LineLayerSpecification } from 'mapbox-gl';
import { RouteInfo } from '@/components/Map/RouteInfo';
import { InteractiveIcon, IconData } from '@/components/Map/InteractiveIcon';
import { Emergency } from '@/types/Emergency';
import { getLayers } from './layers';

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
    const layers = getLayers(iconData, userLocation, victimOnClick);

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

    return (
        <div className="relative w-full h-[100vh]">
            <Map
                initialViewState={userLocation ? {
                    longitude: userLocation[0],
                    latitude: userLocation[1],
                    zoom: 12
                } : {
                    longitude: -73.996,
                    latitude: 40.7128,
                    zoom: 12
                }}
                mapStyle="mapbox://styles/mapbox/dark-v10"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            >
                <DeckGLOverlay layers={layers} />
                <NavigationControl position="top-left" />

                {routeData && (
                    <Source id="route" type="geojson" data={routeData}>
                        <Layer {...routeLayerStyle} />
                    </Source>
                )}
            </Map>

            {routeInfo.distance > 0 && <RouteInfo duration={routeInfo.duration} distance={routeInfo.distance} position={selectedVictim?.position} />}


            {selectedVictim && popoverPosition && (
                <InteractiveIcon
                    icon={selectedVictim}
                    position={popoverPosition}
                    onClose={() => {
                        setPopoverPosition(null);
                    }}
                    emergency={emergencies.find((e) => e.id === selectedVictim.id) as Emergency}
                    onNavigate={() => {
                        getDirections(selectedVictim.position);
                    }}
                />
            )}
        </div>
    );
}