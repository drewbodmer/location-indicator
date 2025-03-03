import { TimelineEvent } from "@/types/TimelineEvent";

const fireTimelineEvents: TimelineEvent[] = [
  {
    id: '1-1',
    title: 'Emergency Services Notified',
    description: 'Local fire department has been dispatched to the location.',
    timestamp: new Date(Date.now() - 2 * 60000).toLocaleString(),
    type: 'action',
    severity: 'high'
  },
  {
    id: '1-2',
    title: 'Fire Detected',
    description: 'Smoke detectors triggered in Room 101.',
    timestamp: new Date(Date.now() - 5 * 60000).toLocaleString(),
    type: 'alert',
    severity: 'high'
  },
  {
    id: '1-3',
    title: 'Evacuation Started',
    description: 'Building evacuation protocol initiated.',
    timestamp: new Date(Date.now() - 7 * 60000).toLocaleString(),
    type: 'action',
    severity: 'high'
  },
  {
    id: '1-4',
    title: 'Smoke Reported',
    description: 'Student reported smoke coming from trash can in Room 101.',
    timestamp: new Date(Date.now() - 15 * 60000).toLocaleString(),
    type: 'notification',
    severity: 'medium'
  }
];

const injuryTimelineEvents: TimelineEvent[] = [
  {
    id: '2-1',
    title: 'Medical Team Dispatched',
    description: 'School nurse and first aid team dispatched to location.',
    timestamp: new Date(Date.now() - 3 * 60000).toLocaleString(),
    type: 'action',
    severity: 'medium'
  },
  {
    id: '2-4',
    title: 'Parents Notified',
    description: 'Parents have been contacted and are on their way.',
    timestamp: new Date(Date.now() - 4 * 60000).toLocaleString(),
    type: 'notification',
    severity: 'low'
  },
  {
    id: '2-3',
    title: 'First Aid Administered',
    description: 'Basic first aid administered by teacher on scene.',
    timestamp: new Date(Date.now() - 6 * 60000).toLocaleString(),
    type: 'update',
    severity: 'medium'
  },
  {
    id: '2-2',
    title: 'Injury Reported',
    description: 'Student reported to have fallen and hit their head in the hallway.',
    timestamp: new Date(Date.now() - 8 * 60000).toLocaleString(),
    type: 'alert',
    severity: 'medium'
  },
];

const trafficTimelineEvents: TimelineEvent[] = [
  {
    id: '3-1',
    title: 'Traffic Control Established',
    description: 'Security personnel directing traffic around incident.',
    timestamp: new Date(Date.now() - 5 * 60000).toLocaleString(), // 5 minutes ago
    type: 'action',
    severity: 'low'
  },
  {
    id: '3-4',
    title: 'Alternate Route Advised',
    description: 'Staff and students advised to use north entrance until cleared.',
    timestamp: new Date(Date.now() - 8 * 60000).toLocaleString(), // 8 minutes ago
    type: 'notification',
    severity: 'low'
  },
  {
    id: '3-3',
    title: 'No Injuries Reported',
    description: 'All parties involved report no injuries.',
    timestamp: new Date(Date.now() - 10 * 60000).toLocaleString(), // 10 minutes ago
    type: 'update',
    severity: 'low'
  },
  {
    id: '3-2',
    title: 'Minor Collision Reported',
    description: 'Two vehicles involved in minor collision near school entrance.',
    timestamp: new Date(Date.now() - 12 * 60000).toLocaleString(), // 12 minutes ago
    type: 'alert',
    severity: 'low' }
];

const emergencyTimelines: { [key: string]: TimelineEvent[] } = {
  '1': fireTimelineEvents,
  '2': injuryTimelineEvents,
  '3': trafficTimelineEvents
};

export async function getTimelineEvents(emergencyId?: string): Promise<TimelineEvent[]> {
  if (!emergencyId || !emergencyTimelines[emergencyId]) {
    return [];
  }
  
  return emergencyTimelines[emergencyId];
}

export async function addTimelineEvent(emergencyId: string, event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent[]> {
  if (!emergencyTimelines[emergencyId]) {
    return [];
  }
  
  const newEvent: TimelineEvent = {
    ...event,
    id: `${emergencyId}-${Date.now()}`,
    timestamp: new Date().toLocaleString()
  };
  
  emergencyTimelines[emergencyId].unshift(newEvent);
  return emergencyTimelines[emergencyId];
}