import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel,
  CalendarCheck,
  TrendingUp,
  Users,
  ChevronRight,
  ChevronDown,
  Star,
  MapPin,
  Shield,
  Globe,
  Search,
  Plus,
  Trash2,
  Edit,
  BarChart3,
  X,
  Sparkles,
  Tag,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useHotelsStore } from '../store/hotelsStore';
import { useBookingsStore } from '../store/bookingsStore';
import { SYRIA_PROVINCES } from '../data/syria';
import {
  PALETTE,
  KhatamMark,
  buildDisplayHotels,
  useHotelBookingFlow,
  HotelDetailsModal,
  BookingFormModal,
  HotelCard,
  HotelBookingFlowStyles,
  themeStyles,
  type DisplayHotel,
} from '../components/HotelBookingFlow';

// ─────────────────────────────────────────────────────────────────────────────
// نقشة الخاتم/المشربية — العنصر البصري المميّز لهذا التصميم، مبني على نفس هوية
// الـ KhatamMark الموجودة أصلاً بالمشروع، ومستخدم بحكمة كخلفية وكفاصل أقسام
// ─────────────────────────────────────────────────────────────────────────────
const latticeTile = (color: string, opacity = 0.16) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='${encodeURIComponent(
    color
  )}' stroke-width='0.75' opacity='${opacity}'%3E%3Cpath d='M32 2 L62 32 L32 62 L2 32 Z'/%3E%3Cpath d='M32 16 L48 32 L32 48 L16 32 Z'/%3E%3C/g%3E%3C/svg%3E`;

function LatticeDivider() {
  return (
    <div
      aria-hidden
      style={{
        height: 22,
        margin: '44px 0 36px',
        backgroundImage: `linear-gradient(90deg, transparent, ${PALETTE.line} 12%, ${PALETTE.line} 88%, transparent), ${latticeTile(
          PALETTE.brass,
          0.5
        )}`,
        backgroundRepeat: 'no-repeat, repeat-x',
        backgroundSize: '100% 1px, 22px 22px',
        backgroundPosition: 'center, center',
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF HOME (Admin / Manager) — عرض واستعراض فقط، بدون أي إمكانية حجز
// ─────────────────────────────────────────────────────────────────────────────
function StaffHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { hotels } = useHotelsStore();
  const { bookings } = useBookingsStore();

  const [time, setTime] = useState(new Date());
  const syriaFlow = useHotelBookingFlow();
  const syriaHotels = useMemo(() => buildDisplayHotels(), []);

  const isManager = false;
  const managerHotelIds: number[] = [];

  const pendingBookingsCount = useMemo(
    () => bookings.filter((b: any) => b.status === 'pending_admin').length,
    [bookings]
  );

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = time.getHours() < 12 ? 'صباح الخير' : time.getHours() < 18 ? 'مساء الخير' : 'طاب مساؤك';

  const STATS = [
    { label: 'إجمالي المنشآت والخدمات', value: isManager ? `${managerHotelIds.length} فندق` : hotels.length.toString(), icon: <Hotel size={18} />, accent: PALETTE.brass },
    { label: 'الحجوزات النشطة الحالية', value: '1,843', icon: <CalendarCheck size={18} />, accent: PALETTE.teal },
    { label: 'أرباح الشهر الحالي (MTD)', value: '$84,200', icon: <TrendingUp size={18} />, accent: PALETTE.pomegranate },
    { label: 'قاعدة العملاء الكلية', value: '1,284', icon: <Users size={18} />, accent: PALETTE.inkSoft },
  ];

  const QUICK: { label: string; desc: string; icon: any; path: string; accent: string }[] = [
    {
      label: 'إدارة الفنادق والمنتجعات',
      desc: isManager ? `${managerHotelIds.length} فندق من فنادقك` : `${hotels.length} منشأة مسجلة حالياً`,
      icon: Hotel,
      path: '/hotels',
      accent: PALETTE.brass,
    },
    {
      label: 'إدارة الحجوزات',
      desc: `${pendingBookingsCount} طلب بانتظار المراجعة`,
      icon: CalendarCheck,
      path: isManager ? '/manager/bookings' : '/bookings',
      accent: PALETTE.pomegranate,
    },
  ];
  if (!isManager) {
    QUICK.unshift({
      label: 'إضافة فندق جديد',
      desc: 'إنشاء منشأة جديدة فوراً',
      icon: Plus,
      path: '/add-hotel',
      accent: PALETTE.teal,
    });
    QUICK.push({
      label: 'التقارير والتحليلات',
      desc: 'نمو متصاعد بنسبة 18%+',
      icon: BarChart3,
      path: '/analytics',
      accent: PALETTE.inkSoft,
    });
  }

  // فلترة الفنادق للمدير — يظهر فقط الفنادق التابعة له
  const accessibleStoreHotels = useMemo(() => {
    if (!isManager) return hotels;
    return hotels.filter((h) => managerHotelIds.includes(h.id));
  }, [isManager, hotels, managerHotelIds]);

  // فلترة الفنادق السورية للمدير
  const accessibleSyriaHotels = useMemo(() => {
    if (!isManager) return syriaHotels;
    const managerHotelNames = new Set(
      hotels
        .filter((h) => managerHotelIds.includes(h.id))
        .map((h) => h.name.replace(/\([^)]*\)/g, '').trim().slice(0, 20).toLowerCase())
    );
    return syriaHotels.filter((h) => {
      const cleanName = h.name.replace(/\([^)]*\)/g, '').trim().slice(0, 20).toLowerCase();
      return managerHotelNames.has(cleanName);
    });
  }, [isManager, syriaHotels, hotels, managerHotelIds]);

  const StaffHotelCard = ({ hotel }: { hotel: any }) => {
    return (
      <div key={hotel.id} className="premium-hotel-card" style={themeStyles.hotelCard}>
        <div style={themeStyles.hotelImageContainer}>
          <img src={hotel.image} alt={hotel.name} style={themeStyles.hotelImg} loading="lazy" />
          <span style={themeStyles.hotelTagBadge}>{hotel.tag}</span>
        </div>
        <div style={{ padding: 20 }}>
          <p style={themeStyles.hotelCardName}>{hotel.name}</p>
          <p style={themeStyles.hotelCardLocation}>
            <MapPin size={13} color={PALETTE.ink400} /> {hotel.city}، {hotel.country}
          </p>
          <div style={themeStyles.hotelCardMetaRow}>
            <span style={themeStyles.hotelRatingContainer}>
              <Star size={13} fill={PALETTE.brass} stroke={PALETTE.brass} /> {hotel.rating}
            </span>
            <span style={themeStyles.hotelPriceContainer}>
              {hotel.price?.toLocaleString?.() ?? hotel.price} <span style={themeStyles.currencyText}>ل.س / ليلة</span>
            </span>
          </div>
          <div style={themeStylesLocal.adminActionRow}>
            <button onClick={() => navigate(`/edit-hotel/${hotel.id}`)} style={themeStylesLocal.btnAdminEdit}>
              <Edit size={14} /> تعديل المنشأة
            </button>
            <button
              onClick={() => {
                if (confirm(`هل أنت متأكد من رغبتك في حذف ${hotel.name}?`)) {
                  alert('تم حذف الفندق بنجاح من قاعدة البيانات التجريبية.');
                }
              }}
              style={themeStylesLocal.btnAdminDelete}
            >
              <Trash2 size={14} /> حذف
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="animate-reveal" style={themeStylesLocal.heroStaff}>
        <div style={themeStylesLocal.heroLattice} />
        <div style={themeStylesLocal.archTopline} />
        <div style={themeStylesLocal.heroText}>
          <p style={themeStylesLocal.eyebrowStaff}>
            <KhatamMark color={PALETTE.brassLight} size={11} />
            لوحة القيادة الإدارية
            <span style={themeStylesLocal.dotSep} />
            {time.toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={themeStylesLocal.heroTitleStaff}>
            {greeting}، {currentUser?.name?.split(' ')[0]}
          </h1>
          <p style={themeStylesLocal.heroSubStaff}>
            لديك حالياً <strong style={themeStylesLocal.highlightTextGold}>{pendingBookingsCount} حجزاً معلقاً</strong>
            {isManager
              ? ` في ${managerHotelIds.length} فندق من فنادقك`
              : ' و 3 مراجعات جديدة تتطلب فحص الإدارة.'
            }
          </p>
          <div style={themeStylesLocal.flexGapWrap}>
            <button className="btn-luxury-glow" style={themeStylesLocal.ctaPrimaryStaff} onClick={() => navigate(isManager ? '/manager/bookings' : '/bookings')}>
              مراجعة طلبات الحجز
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
            {!isManager && (
              <button className="btn-luxury-secondary" style={themeStylesLocal.ctaSecondaryStaff} onClick={() => navigate('/add-hotel')}>
                إضافة فندق سوري جديد
                <Plus size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="staff-status-card" style={themeStylesLocal.heroCardStaff}>
          <div style={themeStylesLocal.statusRing}>
            <Shield size={22} color={PALETTE.brassLight} />
          </div>
          <p style={themeStylesLocal.systemStatusTitle}>حالة النظام الأساسي</p>
          <div style={themeStylesLocal.flexCenterGap6}>
            <span style={themeStylesLocal.statusIndicatorGreen} />
            <p style={themeStylesLocal.statusTextGreen}>مستقر بالكامل</p>
          </div>
          <p style={themeStylesLocal.systemStatusSub}>جميع البوابات تعمل بكفاءة</p>
        </div>
      </div>

      {/* شريط المؤشرات — لوحة واحدة موحّدة بأعمدة مفصولة بخطوط رفيعة، بدل بطاقات متفرقة */}
      <div className="animate-reveal delay-1 metrics-band" style={themeStylesLocal.metricsBand}>
        {STATS.map((s, i) => (
          <div key={s.label} className="metric-col" style={{ ...themeStylesLocal.metricCol, borderInlineStart: i === 0 ? 'none' : `1px solid ${PALETTE.line}` }}>
            <div style={themeStylesLocal.metricTopRow}>
              <span style={{ color: s.accent }}>{s.icon}</span>
              <span style={{ ...themeStylesLocal.metricAccentBar, background: s.accent }} />
            </div>
            <p style={themeStylesLocal.metricVal}>{s.value}</p>
            <p style={themeStylesLocal.metricLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      <p className="animate-reveal delay-2" style={themeStyles.sectionTitle}>
        <KhatamMark />العمليات السريعة للنظام
      </p>
      {/* قائمة عمليات على شكل صفوف — واجهة تحكّم احترافية بدل بلاطات ملوّنة */}
      <div className="animate-reveal delay-2 action-list" style={themeStylesLocal.actionList}>
        {QUICK.map((q) => (
          <button key={q.path} className="action-row" style={themeStylesLocal.actionRow} onClick={() => navigate(q.path)}>
            <span style={{ ...themeStylesLocal.actionIconRing, borderColor: `${q.accent}55`, color: q.accent }}>
              <q.icon size={18} />
            </span>
            <span style={themeStylesLocal.actionTextCol}>
              <span style={themeStylesLocal.actionLabel}>{q.label}</span>
              <span style={themeStylesLocal.actionDesc}>{q.desc}</span>
            </span>
            <ChevronRight size={17} color={PALETTE.ink400} style={{ transform: 'rotate(180deg)' }} />
          </button>
        ))}
      </div>

      <LatticeDivider />

      <div className="animate-reveal delay-3" style={themeStyles.sectionHeaderFlex}>
        <p style={{ ...themeStyles.sectionTitle, margin: 0 }}>
          <KhatamMark />الفنادق والمنتجعات الحالية (لوحة التحكم)
        </p>
        <button className="see-all-btn" style={themeStylesLocal.seeAllBtn} onClick={() => navigate('/hotels')}>
          عرض تفاصيل الفنادق <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <div className="animate-reveal delay-3" style={themeStyles.hotelsGrid}>
        {accessibleStoreHotels.slice(0, 4).map((h: any) => (
          <StaffHotelCard key={h.id} hotel={h} />
        ))}
      </div>

      {accessibleSyriaHotels.length > 0 && (
        <div className="animate-reveal delay-3" style={{ marginTop: 48 }}>
          <p style={themeStyles.sectionTitle}>
            <KhatamMark />{isManager ? 'فنادقك المعروضة للنزلاء' : 'الفنادق السورية المعروضة للنزلاء (استعراض فقط)'}
          </p>
          <div style={themeStyles.hotelsGrid}>
            {accessibleSyriaHotels.map((h: DisplayHotel) => (
              <HotelCard key={h.id} hotel={h} onViewDetails={() => syriaFlow.openDetails(h)} />
            ))}
          </div>
        </div>
      )}

      {syriaFlow.viewHotel && (
        <HotelDetailsModal hotel={syriaFlow.viewHotel} onClose={syriaFlow.closeDetails} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER HOME (Client / Guest)
// ─────────────────────────────────────────────────────────────────────────────
function UserHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const flow = useHotelBookingFlow(navigate);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const allHotels = useMemo(() => buildDisplayHotels(), []);
  const offerHotels = useMemo(() => allHotels.filter((h) => !!h.offerText), [allHotels]);

  const byProvince = useMemo(() => {
    if (selectedProvinceId === 'all') return allHotels;
    return allHotels.filter((h) => h.provinceId === selectedProvinceId);
  }, [allHotels, selectedProvinceId]);

  const byCity = useMemo(() => {
    if (selectedCity === 'all') return byProvince;
    return byProvince.filter((h) => h.city === selectedCity);
  }, [byProvince, selectedCity]);

  const availableCities = useMemo(() => Array.from(new Set(byProvince.map((h) => h.city).filter(Boolean))), [byProvince]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allHotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.provinceName.toLowerCase().includes(q)
    );
  }, [allHotels, searchQuery]);

  const isFiltering = selectedProvinceId !== 'all' || selectedCity !== 'all';

  return (
    <>
      <div className="animate-reveal" style={themeStylesLocal.heroUser}>
        <div style={themeStylesLocal.heroLatticeUser} />
        <div style={themeStylesLocal.heroBlobUser} />
        <div style={themeStylesLocal.archTopline} />
        <p style={themeStylesLocal.eyebrowUser}>
          <Sparkles size={13} color={PALETTE.brassLight} /> مرحباً بك مجدداً، {currentUser?.name?.split(' ')[0] || 'ضيفنا الكريم'}
        </p>
        <h1 style={themeStylesLocal.heroTitleUser}>
          اكتشف ملاذك الفاخر
          <br />
          وإقامتك الاستثنائية في سوريا
        </h1>
        <p style={themeStylesLocal.heroSubUser}>تصفح أكثر من {allHotels.length} فندق نخبوي فريد داخل ١٣ محافظة سورية</p>

        <div className="luxury-search-shadow" style={themeStylesLocal.searchBarContainer}>
          <Search size={19} color={PALETTE.teal} style={{ flexShrink: 0 }} />
          <input
            style={themeStylesLocal.searchBarInput}
            placeholder="ابحث عن الفنادق، المدن، أو المحافظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button style={themeStylesLocal.searchClearBtn} onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {searchResults && (
        <div className="animate-reveal">
          <p style={themeStyles.sectionTitle}>
            <KhatamMark />عثرنا على {searchResults.length} نتيجة لبحثك عن "{searchQuery}"
          </p>
          <div style={themeStyles.hotelsGrid}>
            {searchResults.map((h) => (
              <HotelCard key={h.id} hotel={h} onViewDetails={() => flow.openDetails(h)} />
            ))}
          </div>
          {searchResults.length === 0 && (
            <div style={themeStyles.noResultsBox}>
              <Hotel size={40} color={PALETTE.ink400} style={{ marginBottom: 12 }} />
              <p style={{ margin: 0 }}>لم نجد منشآت مطابقة للبحث داخل المحافظات السورية.</p>
            </div>
          )}
        </div>
      )}

      {!searchResults && (
        <>
          {offerHotels.length > 0 && (
            <div className="animate-reveal delay-1" style={{ marginBottom: 36 }}>
              <p style={themeStyles.sectionTitle}>
                <Tag size={16} color={PALETTE.pomegranate} /> عروض حصرية لفترة محدودة
              </p>
              <div className="no-scrollbar offers-row" style={themeStylesLocal.offersRow}>
                {offerHotels.map((h) => (
                  <div key={h.id} className="offer-card" style={themeStylesLocal.offerCard} onClick={() => flow.openDetails(h)}>
                    <img src={h.image} alt={h.name} style={themeStylesLocal.offerImg} loading="lazy" />
                    <div style={themeStylesLocal.offerOverlay} />
                    <div style={themeStylesLocal.offerContent}>
                      <p style={themeStylesLocal.offerHotelName}>{h.name}</p>
                      <p style={themeStylesLocal.offerTextLine}>{h.offerText}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="animate-reveal delay-1" style={themeStyles.sectionHeaderFlex}>
            <p style={{ ...themeStyles.sectionTitle, margin: 0 }}>
              <KhatamMark />إقامات سورية فاخرة موصى بها لك
            </p>
          </div>
          <div className="animate-reveal delay-1" style={themeStyles.hotelsGrid}>
            {allHotels.slice(0, 4).map((h) => (
              <HotelCard key={h.id} hotel={h} onViewDetails={() => flow.openDetails(h)} />
            ))}
          </div>

          <LatticeDivider />

          {/* لوحة "دقّق وجهتك" — تستبدل صفوف الشرائح القابلة للتمرير بقائمتين منسدلتين أنيقتين */}
          <div className="animate-reveal delay-2 dest-panel" style={themeStylesLocal.destPanel}>
            <div style={themeStylesLocal.destPanelHeader}>
              <p style={themeStylesLocal.destPanelTitle}>
                <SlidersHorizontal size={16} color={PALETTE.teal} /> استكشف الفخامة السورية حسب الوجهة
              </p>
              {isFiltering && (
                <button
                  className="dest-reset"
                  style={themeStylesLocal.destResetBtn}
                  onClick={() => {
                    setSelectedProvinceId('all');
                    setSelectedCity('all');
                  }}
                >
                  <RotateCcw size={13} /> إعادة ضبط
                </button>
              )}
            </div>

            <div style={themeStylesLocal.destFieldsRow}>
              <label style={themeStylesLocal.destField}>
                <span style={themeStylesLocal.destFieldLabel}>
                  <Globe size={13} /> المحافظة
                </span>
                <span style={themeStylesLocal.destSelectWrap}>
                  <select
                    className="dest-select"
                    style={themeStylesLocal.destSelect}
                    value={selectedProvinceId}
                    onChange={(e) => {
                      setSelectedProvinceId(e.target.value);
                      setSelectedCity('all');
                    }}
                  >
                    <option value="all">كل المحافظات</option>
                    {SYRIA_PROVINCES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} color={PALETTE.ink400} style={themeStylesLocal.destSelectIcon} />
                </span>
              </label>

              <label style={themeStylesLocal.destField}>
                <span style={themeStylesLocal.destFieldLabel}>
                  <MapPin size={13} /> المدينة
                </span>
                <span style={themeStylesLocal.destSelectWrap}>
                  <select
                    className="dest-select"
                    style={themeStylesLocal.destSelect}
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="all">كل المدن الداخلية</option>
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} color={PALETTE.ink400} style={themeStylesLocal.destSelectIcon} />
                </span>
              </label>

              <div style={themeStylesLocal.destResultChip}>
                <span style={themeStylesLocal.destResultCount}>{byCity.length}</span>
                <span style={themeStylesLocal.destResultLabel}>منشأة متاحة</span>
              </div>
            </div>
          </div>

          <div style={{ ...themeStyles.hotelsGrid, marginTop: 24 }}>
            {byCity.map((h) => (
              <HotelCard key={h.id} hotel={h} onViewDetails={() => flow.openDetails(h)} />
            ))}
          </div>
          {byCity.length === 0 && (
            <div style={themeStyles.noResultsBox}>
              <Hotel size={40} color={PALETTE.ink400} style={{ marginBottom: 12 }} />
              <p style={{ margin: 0 }}>لا توجد أي فنادق متاحة في المنطقة السورية المحددة حالياً.</p>
            </div>
          )}
        </>
      )}

      {flow.viewHotel && (
        <HotelDetailsModal
          hotel={flow.viewHotel}
          onClose={flow.closeDetails}
          onBook={() => flow.startBooking(flow.viewHotel!)}
        />
      )}
      {flow.bookingHotel && <BookingFormModal hotel={flow.bookingHotel} flow={flow} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { currentUser } = useAuthStore();
  const isStaff = currentUser?.role === 'superadmin';

  return (
    <Layout>
      <HotelBookingFlowStyles />
      <style>{`
        .luxestay-root { font-family: 'Cairo', 'Tajawal', system-ui, sans-serif; }
        .luxestay-root h1, .luxestay-root h2, .luxestay-root h3 { font-family: 'Amiri', 'Cairo', serif; }

        /* شريط المؤشرات */
        .metric-col { transition: background 0.3s ease; }
        .metric-col:hover { background: ${PALETTE.page}; }

        /* قائمة العمليات السريعة */
        .action-row { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .action-row:hover { background: ${PALETTE.page} !important; padding-inline-start: 24px !important; }

        .btn-luxury-secondary { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .btn-luxury-secondary:hover { background: rgba(255, 255, 255, 0.15) !important; border-color: rgba(255, 255, 255, 0.35) !important; transform: translateY(-2px); }
        .btn-luxury-glow:hover { filter: brightness(1.08); transform: translateY(-2px); }

        .see-all-btn { transition: all 0.3s ease; }
        .see-all-btn:hover { color: ${PALETTE.teal} !important; transform: translateX(-4px); }

        .luxury-search-shadow { box-shadow: 0 12px 35px rgba(13, 22, 38, 0.22); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .luxury-search-shadow:focus-within { transform: scale(1.015); box-shadow: 0 20px 40px rgba(198, 154, 61, 0.28); border-color: ${PALETTE.brass}66 !important; }

        .offers-row { scroll-snap-type: x proximity; }
        .offer-card { scroll-snap-align: start; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        .offer-card:hover { transform: translateY(-4px); }

        /* لوحة الوجهات */
        .dest-select { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .dest-select:focus { outline: none; border-color: ${PALETTE.teal}88 !important; box-shadow: 0 0 0 3px ${PALETTE.teal}1f; }
        .dest-reset { transition: all 0.2s ease; }
        .dest-reset:hover { background: ${PALETTE.page} !important; color: ${PALETTE.pomegranate} !important; }

        .staff-status-card { transition: transform 0.3s ease; }
        .staff-status-card:hover { transform: translateY(-3px); }

        @media (max-width: 720px) {
          .metrics-band { grid-template-columns: repeat(2, 1fr) !important; }
          .metric-col:nth-child(3) { border-inline-start: none !important; border-top: 1px solid ${PALETTE.line}; }
          .dest-fields-row { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>
      <div className="luxestay-root" style={{ direction: 'rtl', padding: '8px 0', background: PALETTE.page }}>
        {isStaff ? <StaffHome /> : <UserHome />}
      </div>
    </Layout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES الخاصة بهذه الصفحة فقط
// ─────────────────────────────────────────────────────────────────────────────
const themeStylesLocal: Record<string, React.CSSProperties> = {
  archTopline: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 3,
    background: `linear-gradient(90deg, transparent, ${PALETTE.brass}, transparent)`,
    borderRadius: '0 0 40px 40px',
  },

  // ── Staff hero ──────────────────────────────────────────────────────────
  heroStaff: {
    background: `linear-gradient(135deg, ${PALETTE.inkDeep} 0%, ${PALETTE.ink} 55%, ${PALETTE.inkSoft} 100%)`,
    borderRadius: '28px 28px 20px 20px',
    padding: '44px',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 28,
    flexWrap: 'wrap',
    marginBottom: 28,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 45px rgba(13, 22, 38, 0.25)',
  },
  heroLattice: {
    position: 'absolute',
    inset: 0,
    backgroundImage: latticeTile('#f3e2b8', 0.05),
    backgroundSize: '64px 64px',
    pointerEvents: 'none',
  },
  heroText: { maxWidth: 580, zIndex: 1 },
  eyebrowStaff: {
    margin: '0 0 12px',
    fontSize: 12.5,
    color: PALETTE.brassLight,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dotSep: { width: 3, height: 3, borderRadius: '50%', background: `${PALETTE.brassLight}88`, display: 'inline-block' },
  heroTitleStaff: { margin: '0 0 12px', fontSize: 33, fontWeight: 700, lineHeight: 1.3, color: '#fff', letterSpacing: '-0.2px' },
  heroSubStaff: { margin: 0, fontSize: 15, color: '#cdd6e4', lineHeight: 1.7, fontWeight: 500 },
  highlightTextGold: { color: PALETTE.brassLight, fontWeight: 700 },
  highlightTextTeal: { color: '#7fd4d1', fontWeight: 700 },
  flexGapWrap: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 },
  ctaPrimaryStaff: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.tealDeep})`,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  ctaSecondaryStaff: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 24px',
    background: 'rgba(255,255,255,.06)',
    color: '#f1f5f9',
    border: `1px solid ${PALETTE.brass}44`,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
  heroCardStaff: {
    background: 'rgba(255,255,255,.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${PALETTE.brass}33`,
    borderRadius: 16,
    padding: '26px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 200,
    textAlign: 'center',
    zIndex: 1,
    boxShadow: '0 15px 30px rgba(0,0,0,0.18)',
  },
  statusRing: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    border: `1px solid ${PALETTE.brass}55`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  systemStatusTitle: { margin: '10px 0 4px', fontWeight: 700, fontSize: 14, color: '#f1f5f9' },
  statusIndicatorGreen: { width: 8, height: 8, borderRadius: '50%', background: '#5ed6b5', boxShadow: '0 0 10px #5ed6b5', display: 'block' },
  statusTextGreen: { margin: 0, fontSize: 12, color: '#5ed6b5', fontWeight: 700 },
  systemStatusSub: { margin: '4px 0 0', fontSize: 11, color: '#93a3bd' },

  // ── Metrics band ─────────────────────────────────────────────────────────
  metricsBand: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    background: PALETTE.paper,
    border: `1px solid ${PALETTE.line}`,
    borderRadius: 18,
    marginBottom: 32,
    overflow: 'hidden',
  },
  metricCol: { padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 6 },
  metricTopRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  metricAccentBar: { width: 20, height: 3, borderRadius: 2, opacity: 0.6 },
  metricVal: { margin: '4px 0 0', fontSize: 26, fontWeight: 800, color: PALETTE.ink900, lineHeight: 1 },
  metricLabel: { margin: 0, fontSize: 12.5, color: PALETTE.ink600, fontWeight: 600 },

  // ── Action list ───────────────────────────────────────────────────────────
  actionList: {
    background: PALETTE.paper,
    border: `1px solid ${PALETTE.line}`,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 8,
  },
  actionRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '18px 22px',
    background: 'none',
    border: 'none',
    borderBottom: `1px solid ${PALETTE.line}`,
    cursor: 'pointer',
    textAlign: 'right',
  },
  actionIconRing: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionTextCol: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  actionLabel: { fontSize: 14.5, fontWeight: 700, color: PALETTE.ink900 },
  actionDesc: { fontSize: 12.5, color: PALETTE.ink600, fontWeight: 500 },

  seeAllBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: PALETTE.teal, fontWeight: 700, fontSize: 13, cursor: 'pointer' },

  adminActionRow: { display: 'flex', gap: 8, marginTop: 14, borderTop: `1px solid ${PALETTE.line}`, paddingTop: 12 },
  btnAdminEdit: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: PALETTE.page, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: PALETTE.ink600, cursor: 'pointer' },
  btnAdminDelete: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: '#fbeceb', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: PALETTE.pomegranate, cursor: 'pointer' },

  // ── User hero ─────────────────────────────────────────────────────────────
  heroUser: {
    background: `linear-gradient(160deg, ${PALETTE.ink} 0%, ${PALETTE.tealDeep} 100%)`,
    borderRadius: '28px 28px 20px 20px',
    padding: '52px 32px 44px',
    color: '#fff',
    marginBottom: 36,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(13, 22, 38, 0.25)',
  },
  heroLatticeUser: {
    position: 'absolute',
    inset: 0,
    backgroundImage: latticeTile('#f3e2b8', 0.05),
    backgroundSize: '64px 64px',
    pointerEvents: 'none',
  },
  heroBlobUser: { position: 'absolute', width: 320, height: 320, background: `radial-gradient(circle, ${PALETTE.brass}22 0%, transparent 65%)`, top: '-18%', left: '-10%', filter: 'blur(25px)' },
  eyebrowUser: { margin: '0 0 10px', fontSize: 14, color: 'rgba(255,255,255,.9)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, position: 'relative', zIndex: 1 },
  heroTitleUser: { margin: '0 0 12px', fontSize: 34, fontWeight: 700, lineHeight: 1.35, color: '#fff', letterSpacing: '-0.3px', position: 'relative', zIndex: 1 },
  heroSubUser: { margin: '0 0 28px', fontSize: 15, color: 'rgba(255,255,255,.82)', fontWeight: 500, position: 'relative', zIndex: 1 },

  searchBarContainer: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '13px 18px', maxWidth: 550, margin: '0 auto', border: '1px solid transparent', position: 'relative', zIndex: 1 },
  searchBarInput: { flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: PALETTE.ink900, fontWeight: 500 },
  searchClearBtn: { background: 'none', border: 'none', color: PALETTE.ink400, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 },

  offersRow: { display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 },
  offerCard: { position: 'relative', minWidth: 260, height: 150, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, boxShadow: '0 10px 25px rgba(21,34,56,0.12)' },
  offerImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  offerOverlay: { position: 'absolute', inset: 0, background: `linear-gradient(0deg, ${PALETTE.inkDeep}ee 0%, transparent 60%)` },
  offerContent: { position: 'absolute', bottom: 0, right: 0, left: 0, padding: '14px 16px' },
  offerHotelName: { margin: '0 0 4px', color: '#fff', fontSize: 13, fontWeight: 700 },
  offerTextLine: { margin: 0, color: PALETTE.brassLight, fontSize: 11, fontWeight: 600 },

  // ── Destination finder (يستبدل صفوف الشرائح) ────────────────────────────
  destPanel: {
    background: PALETTE.paper,
    border: `1px solid ${PALETTE.line}`,
    borderRadius: 18,
    padding: '22px 24px',
  },
  destPanelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 },
  destPanelTitle: { display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: 15, fontWeight: 700, color: PALETTE.ink900 },
  destResetBtn: { display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${PALETTE.line}`, borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, color: PALETTE.ink600, cursor: 'pointer' },
  destFieldsRow: { display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' },
  destField: { display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 220px', minWidth: 200 },
  destFieldLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: PALETTE.ink600 },
  destSelectWrap: { position: 'relative', display: 'block' },
  destSelect: {
    width: '100%',
    appearance: 'none',
    WebkitAppearance: 'none',
    background: PALETTE.page,
    border: `1px solid ${PALETTE.line}`,
    borderRadius: 10,
    padding: '11px 40px 11px 14px',
    fontSize: 14,
    fontWeight: 600,
    color: PALETTE.ink900,
    cursor: 'pointer',
  },
  destSelectIcon: { position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', pointerEvents: 'none' },
  destResultChip: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    background: `${PALETTE.teal}12`,
    border: `1px solid ${PALETTE.teal}30`,
    borderRadius: 10,
    padding: '10px 16px',
    flexShrink: 0,
  },
  destResultCount: { fontSize: 18, fontWeight: 800, color: PALETTE.tealDeep },
  destResultLabel: { fontSize: 12.5, fontWeight: 600, color: PALETTE.ink600 },

  flexCenterGap6: { display: 'flex', alignItems: 'center', gap: 6 },
};