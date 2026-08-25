import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SYRIA_HOTELS, SYRIA_PROVINCES } from '../data/syria';

export type HotelStatus = 'active' | 'inactive';

export interface HotelEntity {
  id: number;
  name: string;
  country: string;
  city: string;
  rating: number;
  price: number;
  rooms: number;
  status: HotelStatus;
  tag: string;
  image: string;
  amenities: string[];
}

// تحويل الفنادق من syria.ts إلى HotelEntity لأغراض المتجر الإداري
// يتم بناؤها برمجياً لضمان التطابق التام مع بيانات العرض
const SYRIAN_SEED_HOTELS: HotelEntity[] = SYRIA_HOTELS.map((h, index) => {
  const province = SYRIA_PROVINCES.find((p) => p.id === h.provinceId);
  const provinceName = province?.name || '';

  // اختيار tag مناسب بناءً على خصائص الفندق
  let tag = 'standard';
  const allText = [...h.features, h.offerText || '', h.name, provinceName].join(' ');
  if (allText.includes('شاطئ') || allText.includes('بحر') || allText.includes('ساحلي') || allText.includes('شاليه')) tag = 'beachfront';
  else if (allText.includes('تراث') || allText.includes('تاريخ') || allText.includes('قديم') || allText.includes('دمشقي')) tag = 'heritage';
  else if (allText.includes('أعمال') || allText.includes('مؤتمرات') || allText.includes('اجتماعات')) tag = 'business';
  else if (h.stars >= 5) tag = 'luxury';
  else if (h.stars >= 4 && h.pricePerNight < 130) tag = 'boutique';

  // عدد الغرف: مقدر بناءً على تصنيف الفندق
  let rooms = 60;
  if (h.stars === 5) rooms = 100 + (index % 5) * 40; // 100-260
  else if (h.stars === 4) rooms = 50 + (index % 5) * 30; // 50-170
  else rooms = 20 + (index % 4) * 20; // 20-80
  if (allText.includes('بوتيك') || allText.includes('تراثي') || allText.includes('صغير')) rooms = Math.min(rooms, 25);

  const price = h.discountPrice ?? h.pricePerNight;

  return {
    id: index + 1,
    name: h.name,
    country: 'سوريا',
    city: h.city,
    rating: h.rating,
    price,
    rooms,
    status: 'active',
    tag,
    image: h.imageUrl,
    amenities: h.features,
  };
});

interface HotelsState {
  hotels: HotelEntity[];
  initFrom: (initialHotels: HotelEntity[]) => void;
  addHotel: (payload: Omit<HotelEntity, 'id' | 'rating' | 'rooms' | 'image'> & { amenitiesText?: string; rating?: number; rooms?: number; image?: string }) => HotelEntity;
  updateHotel: (id: number, patch: Partial<HotelEntity>) => void;
}

export const useHotelsStore = create<HotelsState>()(
  persist(
    (set, get) => ({
      // هنا قمنا بتمرير القائمة السورية لتظهر تلقائياً كبيانات افتراضية
      hotels: SYRIAN_SEED_HOTELS, 

      initFrom: (initialHotels) => {
        // نملأ المتجر فقط إذا كان فارغاً تماماً من أي فنادق
        if (get().hotels.length > 0) return;
        set({ hotels: initialHotels.length > 0 ? initialHotels : SYRIAN_SEED_HOTELS });
      },

      addHotel: (payload) => {
        const nextId = get().hotels.reduce((m, h) => Math.max(m, h.id), 0) + 1;
        const amenities = (payload.amenitiesText ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const hotel: HotelEntity = {
          id: nextId,
          name: payload.name,
          country: payload.country || 'سوريا', // جعل سوريا القيمة الافتراضية للبلد
          city: payload.city,
          status: payload.status,
          tag: payload.tag,
          price: payload.price,
          rooms: payload.rooms ?? 0,
          rating: payload.rating ?? 4.7,
          // تعديل الصورة الافتراضية عند عدم الرفع لتناسب فنادقنا
          image:
            payload.image && payload.image.trim().length
              ? payload.image
              : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=700&q=80', 
          amenities: amenities.length > 0 ? amenities : ['واي فاي مجاني', 'تكييف كامل'],
        };

        set((s) => ({ hotels: [hotel, ...s.hotels] }));
        return hotel;
      },

      updateHotel: (id, patch) => {
        set((s) => ({ hotels: s.hotels.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
      },
    }),
    { name: 'stay-hotels' }
  )
);