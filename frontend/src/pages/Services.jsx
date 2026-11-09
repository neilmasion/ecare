import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getServices } from '../api/client';
import { useDebounce } from '../hooks/useDebounce';
import ServiceModal from '../components/ServiceModal';
import { ServiceCardSkeleton } from '../components/Skeleton';

const categories = [
  { id: 'all', label: 'All Services' },
  { id: 'clearance', label: 'Clearances & Permits' },
  { id: 'financial', label: 'Financial Aid' },
  { id: 'health', label: 'Health & Medical' },
  { id: 'appointment', label: 'Appointments' },
  { id: 'incident', label: 'Incident Reports' },
  { id: 'community', label: 'Community Programs' },
];

const getCategoryStyle = (category) => {
  switch (category?.toLowerCase()) {
    case 'clearance':
      return { icon: 'fa-stamp', bg: 'bg-blue-50 text-blue-600' };
    case 'health':
    case 'medical':
      return { icon: 'fa-heart-pulse', bg: 'bg-rose-50 text-rose-600' };
    case 'financial':
      return { icon: 'fa-hand-holding-dollar', bg: 'bg-emerald-50 text-emerald-600' };
    case 'appointment':
      return { icon: 'fa-calendar-check', bg: 'bg-indigo-50 text-indigo-600' };
    case 'incident':
      return { icon: 'fa-shield-halved', bg: 'bg-amber-50 text-amber-600' };
    case 'community':
      return { icon: 'fa-users', bg: 'bg-violet-50 text-violet-600' };
    default:
      return { icon: 'fa-hand-holding-heart', bg: 'bg-blue-50 text-blue-600' };
  }
};

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    setLoading(true);
    getServices({ category: activeCategory, search: debouncedSearch })
      .then(res => setServices(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, debouncedSearch]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Clean Dashboard Header */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 py-6 px-6 sm:px-10 lg:px-12 transition-colors duration-150">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Community Services
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Browse available barangay clearances, medical support, and community assistance programs.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs"></i>
            <input
              type="text"
              placeholder="Search services..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs"
                aria-label="Clear search"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto py-6 px-6 sm:px-10 lg:px-12 space-y-6">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center py-12 px-4 shadow-xs max-w-md mx-auto">
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-2.5 text-base">
              <i className="fa-regular fa-folder-open"></i>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">No services found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Try adjusting your search query or selecting another category.
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchInput(''); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <i className="fa-solid fa-arrow-rotate-left text-[10px]"></i>
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const catStyle = getCategoryStyle(service.category);
              return (
                <div
                  key={service.id || service.slug}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Category Icon + Category Label */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${catStyle.bg} dark:bg-opacity-20 flex items-center justify-center text-sm shrink-0`}>
                        <i className={`fa-solid ${catStyle.icon}`}></i>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {service.category_display || service.category}
                      </span>
                    </div>

                    {/* Service Title */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug">
                      {service.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {service.short_description || service.description}
                    </p>
                  </div>

                  {/* Bottom: Meta + Actions */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] py-2 border-t border-slate-100 dark:border-slate-800 mb-3">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        <i className="fa-regular fa-clock text-[10px]"></i>
                        <span>{service.processing_time || '24-48 hours'}</span>
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {service.fee || 'Free'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedService(service)}
                        className="flex-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
                      >
                        Requirements
                      </button>
                      <button
                        onClick={() => navigate(`/assistance?service=${encodeURIComponent(service.slug || service.title)}`)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <span>Apply</span>
                        <i className="fa-solid fa-arrow-right text-[9px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service Modal */}
      <ServiceModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};

export default Services;
