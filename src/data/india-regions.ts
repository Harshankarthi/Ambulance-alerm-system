import { RoutePoint } from '@/types/ambulance';

export interface Region {
    id: string;
    name: string;
    lat: number;
    lng: number;
    routePoints?: RoutePoint[]; // Optional featured route
}

export interface StateData {
    id: string;
    name: string;
    districts: Region[];
}

export const INDIA_REGIONS: StateData[] = [
    {
        id: 'tamil-nadu',
        name: 'Tamil Nadu',
        districts: [
            {
                id: 'chennai',
                name: 'Chennai',
                lat: 13.0604,
                lng: 80.2496,
                routePoints: [
                    { lat: 13.0604, lng: 80.2496 },
                    { lat: 13.0560, lng: 80.2550 },
                    { lat: 13.0500, lng: 80.2600 },
                    { lat: 13.0450, lng: 80.2650 },
                    { lat: 13.0400, lng: 80.2700 },
                ]
            },
            {
                id: 'coimbatore',
                name: 'Coimbatore',
                lat: 11.0168,
                lng: 76.9558,
                routePoints: [
                    { lat: 11.0168, lng: 76.9558 },
                    { lat: 11.0200, lng: 76.9650 },
                    { lat: 11.0250, lng: 76.9750 },
                    { lat: 11.0300, lng: 76.9850 },
                    { lat: 11.0350, lng: 77.0000 },
                ]
            },
            {
                id: 'madurai',
                name: 'Madurai',
                lat: 9.9252,
                lng: 78.1198,
                routePoints: [
                    { lat: 9.9252, lng: 78.1198 },
                    { lat: 9.9200, lng: 78.1150 },
                    { lat: 9.9150, lng: 78.1100 },
                    { lat: 9.9100, lng: 78.1050 },
                ]
            },
            { id: 'trichy', name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
            { id: 'salem', name: 'Salem', lat: 11.6643, lng: 78.1460 },
            { id: 'erode', name: 'Erode', lat: 11.3410, lng: 77.7172 },
            { id: 'tiruppur', name: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
            { id: 'vellore', name: 'Vellore', lat: 12.9165, lng: 79.1325 },
            { id: 'tuticorin', name: 'Thoothukudi', lat: 8.8053, lng: 78.1460 },
            { id: 'kanyakumari', name: 'Kanyakumari', lat: 8.0883, lng: 77.5385 },
            { id: 'tirunelveli', name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
            { id: 'thanjavur', name: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
        ]
    },
    {
        id: 'karnataka',
        name: 'Karnataka',
        districts: [
            {
                id: 'bangalore',
                name: 'Bangalore',
                lat: 12.9716,
                lng: 77.5946,
                routePoints: [
                    { lat: 12.9716, lng: 77.5946 },
                    { lat: 12.9720, lng: 77.5960 },
                    { lat: 12.9725, lng: 77.5975 },
                    { lat: 12.9730, lng: 77.5990 },
                    { lat: 12.9738, lng: 77.6005 },
                    { lat: 12.9745, lng: 77.6020 },
                ]
            },
            { id: 'mysore', name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
            { id: 'hubli', name: 'Hubballi', lat: 15.3647, lng: 75.1240 },
            { id: 'mangalore', name: 'Mangaluru', lat: 12.9141, lng: 74.8560 },
        ]
    },
    {
        id: 'maharashtra',
        name: 'Maharashtra',
        districts: [
            { id: 'mumbai', name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { id: 'pune', name: 'Pune', lat: 18.5204, lng: 73.8567 },
            { id: 'nagpur', name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
        ]
    },
    {
        id: 'kerala',
        name: 'Kerala',
        districts: [
            { id: 'kochi', name: 'Kochi', lat: 9.9312, lng: 76.2673 },
            { id: 'trivandrum', name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
        ]
    },
    {
        id: 'delhi',
        name: 'Delhi',
        districts: [
            { id: 'new-delhi', name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
        ]
    },
    {
        id: 'andhra-pradesh',
        name: 'Andhra Pradesh',
        districts: [
            { id: 'visakhapatnam', name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
            { id: 'vijayawada', name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
        ]
    },
    {
        id: 'telangana',
        name: 'Telangana',
        districts: [
            { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
        ]
    },
    {
        id: 'gujarat',
        name: 'Gujarat',
        districts: [
            { id: 'ahmedabad', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
            { id: 'surat', name: 'Surat', lat: 21.1702, lng: 72.8311 },
        ]
    }
];
