import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, AlertTriangle, Bell, RefreshCw, Phone } from 'lucide-react';
import { getTimelineEvents, addTimelineEvent } from "@/lib/api/timeline";
import { TimelineEvent } from "@/types/TimelineEvent";
import { timeToTimeAgo } from "@/lib/utils";
import { Emergency } from "@/types/Emergency";


export default function TimelineInfo({ emergency }: { emergency: Emergency }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [emergencyServicesContacted, setEmergencyServicesContacted] = useState(false);
  const [lastContacted, setLastContacted] = useState<Date | null>(null);

  const loadEvents = async () => {
    if (!emergency || !emergency.id) {
      setEvents([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const timelineEvents = await getTimelineEvents(emergency.id);
      setEvents(timelineEvents);
      
      // Check if emergency services have been contacted by looking for a specific event type
      const contactEvent = timelineEvents.find(event => 
        event.title.includes('Emergency Services Contacted') || 
        event.title.includes('911 Called')
      );
      
      if (contactEvent) {
        setEmergencyServicesContacted(true);
        setLastContacted(new Date(contactEvent.timestamp));
      }
    } catch (error) {
      console.error("Failed to load timeline events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [emergency.id, isOpen]);

  const contactEmergencyServices = async () => {
    if (!emergency || !emergency.id) return;
    
    setEmergencyServicesContacted(true);
    const contactTime = new Date();
    setLastContacted(contactTime);
    
    try {
      // Add a new event to the timeline
      const newEvent = {
        title: "911 Called",
        description: `Emergency services contacted about ${emergency.type} incident.`,
        type: "action" as const,
        severity: "high" as const,
      };
      
      const updatedEvents = await addTimelineEvent(emergency.id, newEvent);
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Failed to add timeline event:", error);
    }
  };

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

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          <Info className="mr-1" />
          Timeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Timeline for {emergency.title}</DialogTitle>
          <DialogDescription>
            View the timeline of events related to this emergency.
          </DialogDescription>
        </DialogHeader>
        
        {/* Emergency Services Contact Section */}
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
              disabled={emergencyServicesContacted}
              className={emergencyServicesContacted ? "bg-green-600" : "bg-red-600 hover:bg-red-700"}
            >
              <Phone className="mr-2 h-4 w-4" />
              {emergencyServicesContacted ? "911 Called" : "Call 911"}
            </Button>
          </div>
        </div>
        
        <div className={`overflow-auto h-[50vh] pr-4`}>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="flex justify-center items-center h-40 text-gray-500">
              No timeline events available for this emergency.
            </div>
          ) : (
            <ol className="ml-1 relative border-l border-gray-200 dark:border-gray-700">
              {events.map((event) => (
                <li key={event.id} className="mb-6 ml-4">
                  <div className={`absolute w-3 h-3 ${getSeverityColor(event.severity)} rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900`}></div>
                  <div className="flex items-center mb-1">
                    {getEventIcon(event.type)}
                    <time className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
                      {timeToTimeAgo(new Date(event.timestamp))}
                    </time>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                  <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400">{event.description}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={loadEvents}>Refresh</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}