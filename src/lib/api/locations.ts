import { Emergency } from '@/types/Emergency';

const userLocation: [number, number] = [-74.006, 40.7228];
const victim1Location: [number, number] = [-73.986, 40.7328];
const victim2Location: [number, number] = [-73.956, 40.7128];
const victim3Location: [number, number] = [-73.986, 40.7128];

export async function getUserLocation(): Promise<[number, number]> {
    return userLocation;
}

const emergencies: Emergency[] = [{
        id: '1',
        location: victim1Location,
        radius: 1,
        type: 'fire',
        title: 'Small Fire',
        description: 'A trashcan is on fire in the classroom',
        timestamp: new Date().toLocaleString(),
        severity: 'high'
    },
    {
        id: '2',
        location: victim2Location,
        radius: 1,
        type: 'injury',
        title: 'Student Injury',
        description: 'A student fell and hit their head',
        timestamp: new Date().toLocaleString(),
        severity: 'medium'
    },
    {
        id: '3',
        location: victim3Location,
        radius: 2,
        type: 'traffic',
        title: 'Minor Traffic Incident',
        description: 'A minor traffic incident',
        timestamp: new Date().toLocaleString(),
        severity: 'low'
    }
] 

export async function getEmergencyLocations(): Promise<Emergency[]> {
    return emergencies;
};