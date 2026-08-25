export interface HotelData {
  id: number;
  name: string;
  country: string;
  city: string;
  rating: number;
  price: number;
  rooms: number;
  status: 'active' | 'inactive';
  tag: string;
  image: string;
  amenities: string[];
}

export const HOTELS: HotelData[] = [
  { id: 1,  name: 'Burj Al Arab Jumeirah',  country: 'UAE',           city: 'Dubai',      rating: 4.9, price: 1800, rooms: 202,  status: 'active', tag: 'Luxury',    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80', amenities: ['Pool', 'Spa', 'Free WiFi', 'Private Beach'] },
  { id: 2,  name: 'Four Seasons Bosphorus', country: 'Turkey',        city: 'Istanbul',   rating: 4.8, price: 520,  rooms: 170,  status: 'active', tag: 'Boutique',  image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&q=80', amenities: ['Spa', 'Free WiFi', 'Gym'] },
  { id: 3,  name: 'Aman Tokyo',             country: 'Japan',         city: 'Tokyo',      rating: 4.9, price: 950,  rooms: 84,   status: 'active', tag: 'Premium',   image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80', amenities: ['Spa', 'Free WiFi', 'Restaurant'] },
  { id: 4,  name: 'The Ritz Paris',         country: 'France',        city: 'Paris',      rating: 4.8, price: 1200, rooms: 142,  status: 'active', tag: 'Historic',  image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&q=80', amenities: ['Spa', 'Bar', 'Free WiFi'] },
  { id: 5,  name: 'Atlantis The Palm',      country: 'UAE',           city: 'Dubai',      rating: 4.7, price: 680,  rooms: 1548, status: 'active', tag: 'Resort',    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=500&q=80', amenities: ['Pool', 'Water Park', 'Free WiFi'] },
  { id: 6,  name: 'Mandarin Oriental',      country: 'Singapore',     city: 'Singapore',  rating: 4.8, price: 760,  rooms: 527,  status: 'active', tag: 'Luxury',    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80', amenities: ['Pool', 'Spa', 'Free WiFi'] },
  { id: 7,  name: 'The Savoy',              country: 'UK',            city: 'London',     rating: 4.7, price: 890,  rooms: 267,  status: 'active', tag: 'Historic',  image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&q=80', amenities: ['Bar', 'Restaurant', 'Free WiFi'] },
  { id: 8,  name: 'Hotel Bel-Air',          country: 'USA',           city: 'Los Angeles',rating: 4.9, price: 1100, rooms: 103,  status: 'active', tag: 'Luxury',    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80', amenities: ['Pool', 'Spa', 'Garden'] },
  { id: 9,  name: 'Marina Bay Sands',       country: 'Singapore',     city: 'Singapore',  rating: 4.6, price: 540,  rooms: 2561, status: 'active', tag: 'Resort',    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&q=80', amenities: ['Infinity Pool', 'Casino', 'Free WiFi'] },
  { id: 10, name: 'Taj Lake Palace',        country: 'India',         city: 'Udaipur',    rating: 4.8, price: 410,  rooms: 83,   status: 'active', tag: 'Heritage',  image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&q=80', amenities: ['Lake View', 'Spa', 'Boat Access'] },
  { id: 11, name: 'Belmond Copacabana',     country: 'Brazil',        city: 'Rio de Janeiro', rating: 4.6, price: 380, rooms: 239, status: 'active', tag: 'Beachfront', image: 'https://images.unsplash.com/photo-1559599238-308793637427?w=500&q=80', amenities: ['Beach Access', 'Pool', 'Free WiFi'] },
  { id: 12, name: 'Hotel Adlon Kempinski',  country: 'Germany',       city: 'Berlin',     rating: 4.7, price: 470,  rooms: 382,  status: 'active', tag: 'Historic',  image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&q=80', amenities: ['Spa', 'Bar', 'Free WiFi'] },
  { id: 13, name: 'Cape Grace',             country: 'South Africa',  city: 'Cape Town',  rating: 4.8, price: 430,  rooms: 121,  status: 'active', tag: 'Boutique',  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80', amenities: ['Marina View', 'Spa', 'Free WiFi'] },
  { id: 14, name: 'Park Hyatt Sydney',      country: 'Australia',     city: 'Sydney',     rating: 4.8, price: 720,  rooms: 155,  status: 'active', tag: 'Luxury',    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&q=80', amenities: ['Harbour View', 'Pool', 'Free WiFi'] },
  { id: 15, name: 'Ciragan Palace',         country: 'Turkey',        city: 'Istanbul',   rating: 4.7, price: 610,  rooms: 313,  status: 'active', tag: 'Palace',    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80', amenities: ['Bosphorus View', 'Spa', 'Pool'] },
  { id: 16, name: 'Four Seasons Damascus',  country: 'Syria',         city: 'Damascus',   rating: 4.5, price: 220,  rooms: 297,  status: 'active', tag: 'Luxury',    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500&q=80', amenities: ['Pool', 'Spa', 'Free WiFi'] },
  { id: 17, name: 'Banyan Tree Bangkok',    country: 'Thailand',      city: 'Bangkok',    rating: 4.7, price: 290,  rooms: 327,  status: 'active', tag: 'Resort',    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80', amenities: ['Rooftop Bar', 'Spa', 'Pool'] },
  { id: 18, name: 'Hôtel de Crillon',       country: 'France',        city: 'Paris',      rating: 4.9, price: 1450, rooms: 124,  status: 'active', tag: 'Palace',    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500&q=80', amenities: ['Spa', 'Bar', 'Free WiFi'] },
  { id: 19, name: 'The Plaza',              country: 'USA',           city: 'New York',   rating: 4.7, price: 980,  rooms: 282,  status: 'active', tag: 'Historic',  image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&q=80', amenities: ['Bar', 'Spa', 'Free WiFi'] },
  { id: 20, name: 'Conrad Maldives',        country: 'Maldives',      city: 'Rangali',    rating: 4.9, price: 1650, rooms: 150,  status: 'active', tag: 'Overwater', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=500&q=80', amenities: ['Overwater Villa', 'Diving', 'Spa'] },
  { id: 21, name: 'Raffles Singapore',      country: 'Singapore',     city: 'Singapore',  rating: 4.8, price: 830,  rooms: 115,  status: 'active', tag: 'Heritage',  image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80', amenities: ['Bar', 'Spa', 'Free WiFi'] },
  { id: 22, name: 'Gritti Palace',          country: 'Italy',         city: 'Venice',     rating: 4.8, price: 990,  rooms: 82,   status: 'active', tag: 'Palace',    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&q=80', amenities: ['Canal View', 'Bar', 'Free WiFi'] },
  { id: 23, name: 'One&Only Cape Town',     country: 'South Africa',  city: 'Cape Town',  rating: 4.7, price: 540,  rooms: 131,  status: 'active', tag: 'Resort',    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&q=80', amenities: ['Marina View', 'Spa', 'Pool'] },
  { id: 24, name: 'Fairmont Banff Springs', country: 'Canada',        city: 'Banff',      rating: 4.6, price: 350,  rooms: 757,  status: 'inactive', tag: 'Castle', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80', amenities: ['Mountain View', 'Spa', 'Golf'] },
  { id: 25, name: 'Amanjena',               country: 'Morocco',       city: 'Marrakech',  rating: 4.8, price: 590,  rooms: 59,   status: 'active', tag: 'Resort',    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80', amenities: ['Pool', 'Spa', 'Garden'] },
  { id: 26, name: 'Belmond Hotel Cipriani', country: 'Italy',         city: 'Venice',     rating: 4.9, price: 1380, rooms: 96,   status: 'active', tag: 'Luxury',    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&q=80', amenities: ['Pool', 'Spa', 'Free WiFi'] },
  { id: 27, name: 'The Oberoi Udaivilas',   country: 'India',         city: 'Udaipur',    rating: 4.9, price: 780,  rooms: 87,   status: 'active', tag: 'Heritage',  image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&q=80', amenities: ['Lake View', 'Spa', 'Pool'] },
  { id: 28, name: 'Shangri-La Bosphorus',   country: 'Turkey',        city: 'Istanbul',   rating: 4.6, price: 320,  rooms: 186,  status: 'inactive', tag: 'Luxury', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=500&q=80', amenities: ['Bosphorus View', 'Spa', 'Pool'] },
];

// COUNTRIES لم يعد مطلوباً بعد فلترة سوريا فقط
// export const COUNTRIES = Array.from(new Set(HOTELS.map((h) => h.country))).sort();

