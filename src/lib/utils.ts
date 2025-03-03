import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface RouteInfo {
  duration: number;
  distance: number;
}

interface RouteData {
  type: string;
  features: {
    type: string;
    properties: {};
    geometry: {
      type: string;
      coordinates: number[][];
    };
  }[];
}

interface FetchResponse {
  routeInfo: RouteInfo;
  routeData: RouteData;
}

export const COLOR_SEVERITY_MAP: { [key: string]: [number, number, number] } = {
  high: [255, 0, 0],
  medium: [255, 165, 0],
  low: [0, 128, 0],
};

export async function fetchDirections(startPosition: [number, number], endPosition: [number, number]): Promise<FetchResponse | undefined> {
  const coordinates = `${startPosition[0]},${startPosition[1]};${endPosition[0]},${endPosition[1]}`;

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?alternatives=false&geometries=geojson&overview=full&steps=false&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch directions');
    }

    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const routeInfo: RouteInfo = {
        duration: route.duration,
        distance: route.distance
      };

      const routeData = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.geometry.coordinates
        }
      };

      return {
        routeInfo,
        routeData: {
          type: 'FeatureCollection',
          features: [routeData]
        }
      };
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching directions:', error);
    return undefined;
  }
}

export function timeToTimeAgo(ts: Date, useSeconds: boolean = true) {
  // modified from https://stackoverflow.com/questions/19540077/converting-unix-time-to-minutes-ago-in-javascript
  // This function computes the delta between the
  // provided timestamp and the current time, then test
  // the delta for predefined ranges.

  const now = new Date();
  const elapsedMilliseconds = now.getTime() - ts.getTime();
  const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const elapsedHours = Math.floor(elapsedMinutes / 60);

  let responseStr: string = "";

  if (elapsedHours > 0) {
    responseStr += `${elapsedHours} hours`;
  }

  if (useSeconds) {
    if (elapsedMinutes > 0) {
      responseStr += (responseStr.length > 0 ? "," : "") + ` ${elapsedMinutes % 60} minutes`;
    }

    if (elapsedSeconds > 0) {
      responseStr += (responseStr.length > 0 ? "," : "") + ` ${elapsedSeconds % 60} seconds`;
    }
  } else {
    if (elapsedMinutes >= 0) {
      responseStr += (responseStr.length > 0 ? "," : "") + ` ${elapsedMinutes % 60} minutes`;
    }
  }

  return responseStr + ' ago';
}