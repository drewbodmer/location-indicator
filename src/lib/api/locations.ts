import { Emergency } from '@/types/Emergency';
import { SafetyAsset } from '@/types/SafetyAsset';

const userLocation: [number, number] = [-74.006, 40.7228];
const emergency1Location: [number, number] = [-73.986, 40.7328];
const emergency2Location: [number, number] = [-73.956, 40.7128];
const emergency3Location: [number, number] = [-73.986, 40.7128];

export async function getUserLocation(): Promise<[number, number]> {
    return userLocation;
}

const emergencies: Emergency[] = [{
        id: '1',
        location: emergency1Location,
        radius: 1,
        type: 'fire',
        title: 'Small Fire',
        description: 'A trashcan is on fire in the classroom',
        timestamp: new Date().toLocaleString(),
        severity: 'high'
    },
    {
        id: '2',
        location: emergency2Location,
        radius: 1,
        type: 'injury',
        title: 'Student Injury',
        description: 'A student fell and hit their head',
        timestamp: new Date().toLocaleString(),
        severity: 'medium'
    },
    {
        id: '3',
        location: emergency3Location,
        radius: 2,
        type: 'traffic',
        title: 'Minor Traffic Incident',
        description: 'A minor traffic incident',
        timestamp: new Date().toLocaleString(),
        severity: 'low'
    }
] 

const assets: Record<string, SafetyAsset[]> = {
 '1': [{
    id: '1-1',
    location: [-73.994, 40.7258],
    type: 'fire_extinguisher',
    title: 'Fire Extinguisher',
    description: 'A fire extinguisher',
    timestamp: new Date().toLocaleString()
 }],
 '2': [{
    id: '2-1',
    location: [-73.980, 40.7148],
    type: 'first_aid',
    title: 'First Aid Kit',
    description: 'A first aid kit',
    timestamp: new Date().toLocaleString()
 }]
} 

export async function getEmergencyLocations(): Promise<Emergency[]> {
    return emergencies;
};

export async function getSafetyAssets(id: string): Promise<SafetyAsset[]> {
    return assets[id];
}