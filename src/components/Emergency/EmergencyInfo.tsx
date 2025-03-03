import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info, AlertTriangle, Bell, RefreshCw, Phone, Image, FileText } from 'lucide-react';
import { addTimelineEvent } from "@/lib/api/timeline";
import { TimelineEvent } from "@/types/TimelineEvent";
import { timeToTimeAgo, getSeverityColor } from "@/lib/utils";
import { Emergency } from "@/types/Emergency";


export default function EmergencyInfo({ timelineEvents, emergency }: { timelineEvents: TimelineEvent[], emergency: Emergency }) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [emergencyServicesContacted, setEmergencyServicesContacted] = useState(false);
    const [lastContacted, setLastContacted] = useState<Date | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("timeline");

    const contactEmergencyServices = async () => {
        if (!emergency || !emergency.id) return;
        setEmergencyServicesContacted(true);
        const contactTime = new Date();
        setLastContacted(contactTime);
        try {
            const newEvent = {
                title: "911 Called",
                description: `Emergency services contacted about ${emergency.type} incident.`,
                type: "action" as const,
                severity: "high" as const,
                timestamp: new Date().toDateString()
            };

            const updatedEvents = await addTimelineEvent(emergency.id, newEvent);
            setEvents(updatedEvents);
        } catch (error) {
            console.error("Failed to add timeline event:", error);
        }
    };

    useEffect(() => {
        setEvents(timelineEvents);
        timelineEvents.forEach(event => {
            if (event.title === '911 Called' && !emergencyServicesContacted) {
                setEmergencyServicesContacted(true);
                setLastContacted(new Date(event.timestamp));
            }
        })
    }, [timelineEvents, emergencyServicesContacted]);

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'alert':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'notification':
                return <Bell className="w-4 h-4 text-blue-500" />;
            case 'update':
                return <RefreshCw className="w-4 h-4 text-green-500" />;
            case 'action':
                return <Info className="w-4 h-4 text-yellow-500" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                        <Info className="mr-1" />
                        Information
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[60vw]">
                    <DialogHeader>
                        <DialogTitle>{emergency.title}</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4 p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Emergency Services</h3>
                                <p className="text-sm text-gray-500">
                                    {emergencyServicesContacted
                                        ? `Contacted ${lastContacted ? timeToTimeAgo(lastContacted, false) : ''}`
                                        : 'Not yet contacted'}
                                </p>
                            </div>
                            <Button
                                onClick={contactEmergencyServices}
                                className={emergencyServicesContacted ? "bg-green-600" : "bg-red-600 hover:bg-red-700"}
                            >
                                <Phone className="mr-2 h-4 w-4" />
                                Call 911
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="timeline" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="timeline">
                                <Bell className="mr-2 h-4 w-4" />
                                Timeline
                            </TabsTrigger>
                            <TabsTrigger value="response-plan">
                                <FileText className="mr-2 h-4 w-4" />
                                Emergency Response Plan
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="overflow-auto h-[50vh] pr-4">
                            {events.length === 0 ? (
                                <div className="flex justify-center items-center h-40 text-gray-500">
                                    No timeline events available for this emergency.
                                </div>
                            ) : (
                                <ol className="ml-1 relative border-l border-gray-200 dark:border-gray-700">
                                    {events.map((event) => (
                                        <li key={event.id} className="mb-6 ml-4">
                                            <div className={`absolute w-3 h-3 ${getSeverityColor(event.severity)} rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900`}></div>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center">
                                                    {getEventIcon(event.type)}
                                                    <time className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
                                                        {timeToTimeAgo(new Date(event.timestamp))}
                                                    </time>
                                                </div>
                                                {event.imgUrl && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="p-1"
                                                        onClick={() => event.imgUrl && setSelectedImage(event.imgUrl)}
                                                    >
                                                        <Image className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                                            <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">{event.description}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </TabsContent>

                        <TabsContent value="response-plan" className="overflow-auto h-[50vh] pr-4">
                            <div className="p-4 border border-gray-200 rounded-md">
                                <h3 className="text-lg font-semibold mb-2">Emergency Response Plan</h3>
                                <p className="text-gray-500">
                                    Response plan information will be displayed here.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                </DialogContent>
            </Dialog>

            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                    <DialogTitle />
                    <DialogContent className="sm:max-w-[80vw] p-0">
                        <div className="relative">
                            <img
                                src={selectedImage}
                                alt="Event Image"
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}