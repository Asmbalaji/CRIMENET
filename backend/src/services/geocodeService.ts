import axios from 'axios';

export const geocodeLocation = async (city: string, state?: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const query = [city, state, 'India'].filter(Boolean).join(', ');
    console.log(`Geocoding query: ${query}`);
    
    // Using OpenStreetMap Nominatim for geocoding
    // Add a unique User-Agent as required by Nominatim usage policy
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'CrimenetInvestigationTool/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon)
      };
    }
    
    console.warn(`Could not geocode location: ${query}`);
    return null;
  } catch (error) {
    console.error('Error during geocoding:', error);
    return null;
  }
};
