export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'notification' | 'update' | 'alert' | 'action';
  severity?: 'low' | 'medium' | 'high';
  imgUrl?: string;
}

