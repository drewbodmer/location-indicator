import React, { useState } from 'react';
import { Clock, MapPin, Navigation, Copy, Check, X } from 'lucide-react';
import { Button } from '../ui/button';

interface RouteInfoProps {
    duration: number;
    distance: number;
    onClose: () => void;
    position?: [number, number];
}

export function RouteInfo({ duration, distance, position, onClose }: RouteInfoProps) {
    const [copied, setCopied] = useState(false);
    const minutes = Math.round(duration / 60);
    const distanceKm = (distance / 1000).toFixed(2);
    const distanceMiles = (distance / 1609.34).toFixed(2);

    const copyToClipboard = () => {
        if (position) {
            const coordsText = `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`;
            navigator.clipboard.writeText(coordsText)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        }
    };

    return (
        <div className="absolute top-4 right-4 z-10">
            <div className="bg-primary/75 rounded-lg border overflow-hidden w-64">
                <div className="text-primary-foreground p-3 flex justify-between items-start">
                    <h3 className="text-lg font-medium ">Route to Emergency</h3>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={onClose}
                        title="Close"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-4 space-y-3 text-primary-foreground">
                    <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium truncate flex-1">
                            {position ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : 'Unknown location'}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-1"
                            onClick={copyToClipboard}
                            title="Copy coordinates"
                            disabled={!position}
                        >
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                    </div>
                    <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">{minutes} min</span>
                        <span className="ml-1">walking</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Navigation className="h-4 w-4 mr-2" />
                        <span className="font-medium">{distanceKm} km</span>
                        <span className="ml-1">({distanceMiles} mi)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}