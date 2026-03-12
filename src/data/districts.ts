import { RoutePoint } from '@/types/ambulance';

export interface District {
  id: string;
  name: string;
  label: string;
  routePoints: RoutePoint[];
}

export const DISTRICTS: District[] = [
  {
    id: 'chennai',
    name: 'Chennai',
    label: 'Chennai (Anna Salai)',
    routePoints: [
      { lat: 13.0604, lng: 80.2496 }, // Start: Gemini Flyover approx
      { lat: 13.0560, lng: 80.2550 },
      { lat: 13.0500, lng: 80.2600 },
      { lat: 13.0450, lng: 80.2650 },
      { lat: 13.0400, lng: 80.2700 }, // End: Towards Guindy
    ],
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    label: 'Coimbatore (Avinashi Rd)',
    routePoints: [
      { lat: 11.0168, lng: 76.9558 }, // Start: Gandhipuram area
      { lat: 11.0200, lng: 76.9650 },
      { lat: 11.0250, lng: 76.9750 },
      { lat: 11.0300, lng: 76.9850 },
      { lat: 11.0350, lng: 77.0000 }, // End: Towards Airport
    ],
  },
  {
    id: 'madurai',
    name: 'Madurai',
    label: 'Madurai (Temple City)',
    routePoints: [
      { lat: 9.9252, lng: 78.1198 }, // Start: Periayar Bus Stand area
      { lat: 9.9200, lng: 78.1150 },
      { lat: 9.9150, lng: 78.1100 },
      { lat: 9.9100, lng: 78.1050 }, // End: Bypass Road
    ],
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    label: 'Bangalore (MG Road)',
    routePoints: [
      { lat: 12.9716, lng: 77.5946 },
      { lat: 12.9720, lng: 77.5960 },
      { lat: 12.9725, lng: 77.5975 },
      { lat: 12.9730, lng: 77.5990 },
      { lat: 12.9738, lng: 77.6005 },
      { lat: 12.9745, lng: 77.6020 },
      { lat: 12.9755, lng: 77.6035 },
      { lat: 12.9765, lng: 77.6050 },
      { lat: 12.9778, lng: 77.6065 },
      { lat: 12.9790, lng: 77.6080 },
      { lat: 12.9805, lng: 77.6095 },
      { lat: 12.9820, lng: 77.6110 },
    ]
  },
  {
    id: 'coimbatore-chennai',
    name: 'Coimbatore -> Chennai',
    label: 'Coimbatore to Chennai (Highway)',
    routePoints: [
      { lat: 11.0168, lng: 76.9558 }, // Coimbatore
      { lat: 11.3410, lng: 77.7172 }, // Erode
      { lat: 11.6643, lng: 78.1460 }, // Salem
      { lat: 11.9401, lng: 79.4861 }, // Villupuram
      { lat: 12.6917, lng: 79.9742 }, // Chengalpattu
      { lat: 13.0827, lng: 80.2707 }, // Chennai
      // Adding intermediate points for smoother simulation (interpolated)
      { lat: 13.0850, lng: 80.2750 },
      { lat: 13.0900, lng: 80.2800 },
    ].flatMap((point, index, array) => {
      // Simple linear interpolation to add density
      if (index === array.length - 1) return [point];
      const next = array[index + 1];

      // Calculate rough distance to determine steps needed (for approx 0.002 deg step size ~ 200m)
      const dist = Math.sqrt(Math.pow(next.lat - point.lat, 2) + Math.pow(next.lng - point.lng, 2));
      const steps = Math.ceil(dist / 0.002); // ~200m per step

      const interpolated = [];
      for (let i = 0; i < steps; i++) {
        interpolated.push({
          lat: point.lat + (next.lat - point.lat) * (i / steps),
          lng: point.lng + (next.lng - point.lng) * (i / steps),
        });
      }
      return interpolated;
    }),
  }
];
