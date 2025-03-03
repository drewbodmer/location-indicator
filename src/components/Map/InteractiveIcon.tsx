import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { X, Navigation} from 'lucide-react';
import { timeToTimeAgo } from "@/lib/utils";
import TimelineInfo from '../TimelineInfo';
import { Emergency } from "@/types/Emergency";

export interface IconData {
    id?: string;
    position: [number, number];
    icon: string;
    size?: number;
    color?: [number, number, number, number?];
    info?: {
        title: string;
        type: string;
        description: string;
        imageUrl?: string;
        timestamp?: string;
        severity?: 'low' | 'medium' | 'high';
    };
}

interface InteractiveIconProps {
    emergency: Emergency;
    icon: IconData;
    position: { x: number; y: number };
    onClose: () => void;
    onNavigate?: () => void;
}

export function InteractiveIcon({ emergency, icon, position, onClose, onNavigate }: InteractiveIconProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [openInfo, setOpenInfo] = useState(false);
    const [emergencyServicesContacted, setEmergencyServicesContacted] = useState(false);
    const [lastContacted, setLastContacted] = useState<Date | null>(null);

    useEffect(() => {
        setIsOpen(true);
    }, [icon]);

    const handleClose = () => {
        setIsOpen(false);
        onClose();
    };

    const handleNavigate = () => {
        if (onNavigate) {
            setIsOpen(false);
            onClose();
            onNavigate();
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'high':
                return 'bg-red-600';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-green-500';
            default:
                return 'bg-blue-500';
        }
    };

    // Create a dummy element to anchor the popover at the icon position
    const anchorStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '1px',
        height: '1px',
        pointerEvents: 'none'
    };

    const contactEmergencyServices = () => {
        setEmergencyServicesContacted(true);
        setLastContacted(new Date());
    };

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                onClose();
            }
        }}>
            <div style={anchorStyle}>
                <PopoverAnchor />
            </div>

            <PopoverContent className="w-80 p-0 border-none shadow-lg" sideOffset={5}>
                <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            {icon.info?.severity && (
                                <div className={`w-3 h-3 rounded-full mr-2 ${getSeverityColor(icon.info.severity)}`}></div>
                            )}
                            <h3 className="font-bold text-lg">{icon.info?.title || 'Incident Details'}</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {icon.info?.imageUrl && (
                        <div className="mb-3">
                            <img
                                src={icon.info.imageUrl}
                                alt={icon.info.title || 'Incident image'}
                                className="w-full h-auto rounded-md"
                            />
                        </div>
                    )}

                    <p className="text-gray-700 mb-2">{icon.info?.description || 'No description available'}</p>
                    <p className='text-muted-foreground text-xs'>{emergencyServicesContacted ? `Available information sent to emergency services ${lastContacted ? timeToTimeAgo(lastContacted, false) : ''}` : ''}</p>

                    {icon.info?.timestamp && (
                        <div className="text-gray-500 text-sm mt-2">
                            <time>last update: {timeToTimeAgo(new Date(icon.info.timestamp))}</time>
                        </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                            className="w-full"
                            onClick={handleNavigate}
                        >
                            <Navigation className="mr-1" />
                            Navigate
                        </Button>
                        {emergency && <TimelineInfo emergency={emergency}/>}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}