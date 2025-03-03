export interface SafetyAsset {
    id: string;
    location: [number, number];
    type: string;
    title: string;
    description: string;
    timestamp?: string;
}