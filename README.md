## Setup

1) Install dependencies

- npm install

2) Configure environment

- Create a .env file (or .env.local for Vite) at the project root and add:

- VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

This key is used by the Applications Map (Admin -> Applications -> Map tab) and the address preview modal.

3) Run

- npm run dev

## Applications Map

- The Applications admin page has two tabs: List and Map.
- The Map tab uses the Google Maps JavaScript API to display markers for unique applicant addresses.
- Geocoding results are cached in localStorage under geoCache:gmap:v1 to reduce API calls.

If the key is missing, the UI will display a warning on the Map tab.