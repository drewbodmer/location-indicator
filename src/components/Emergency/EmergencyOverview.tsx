import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { X, Navigation, Clock, RefreshCw } from 'lucide-react';
import { timeToTimeAgo, getSeverityColor } from "@/lib/utils";
import EmergencyInfo from './EmergencyInfo';
import { Emergency } from "@/types/Emergency";
import { TimelineEvent } from "@/types/TimelineEvent";
import { getTimelineEvents } from "@/lib/api/timeline";

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
        severity?: 'low' | 'medium' | 'high';
    };
    emergency?: Emergency;
}

interface InteractiveIconProps {
    emergency: Emergency;
    icon: IconData;
    position: { x: number; y: number };
    onClose: () => void;
    onNavigate?: (emergency: Emergency) => void;
}

export function EmergencyOverview({ emergency, icon, position, onClose, onNavigate }: InteractiveIconProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const [emergencyServicesContacted, setEmergencyServicesContacted] = useState(false);
    const [lastContacted, setLastContacted] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        setIsOpen(true);
    }, [icon]);

    const handleClose = () => {
        setIsOpen(false);
        onClose();
    };

    const handleNavigate = () => {
        if (onNavigate) {
            onNavigate(emergency);
            handleClose();
        }
    };

    const loadEvents = async () => {
        try {
            const timelineEvents = await getTimelineEvents(emergency.id);
            setEvents(timelineEvents);

            // Hack to check if emergency services have been contacted
            const contactEvent = timelineEvents.find(event =>
                event.title.includes('911 Called')
            );

            if (contactEvent) {
                setEmergencyServicesContacted(true);
                setLastContacted(new Date(contactEvent.timestamp));
            }

            if (timelineEvents.length > 0) {
                // assuming received events are ordered by timestamp decreasing
                setStartTime(new Date(timelineEvents[timelineEvents.length - 1].timestamp));
                setLastUpdated(new Date(timelineEvents[0].timestamp));
            }
        } catch (error) {
            console.error("Failed to load timeline events:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadEvents();
        }
    }, [isOpen, emergency?.id, loadEvents]);

    // Create a dummy element to anchor the popover at the icon position
    const anchorStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '1px',
        height: '1px',
        pointerEvents: 'none'
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

                    <div className="text-muted-foreground text-xs mt-2">
                        {startTime && (
                            <div className="flex items-center mb-1">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Started: {timeToTimeAgo(startTime)}</span>
                            </div>
                        )}
                        {lastUpdated && (
                            <div className="flex items-center">
                                <RefreshCw className="h-4 w-4 mr-1" />
                                <span>Last update: {timeToTimeAgo(lastUpdated)}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                            className="w-full"
                            onClick={handleNavigate}
                        >
                            <Navigation className="mr-1" />
                            Navigate
                        </Button>
                        {emergency && <EmergencyInfo timelineEvents={events} emergency={emergency} />}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}