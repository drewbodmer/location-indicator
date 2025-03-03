export interface Emergency {
    id: string;
    location: [number, number];
    radius: number;
    type: string;
    title: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
    timestamp?: string;
}