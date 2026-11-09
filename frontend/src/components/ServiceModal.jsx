import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceModal = ({ service, isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const handleApply = () => {
    onClose();
    navigate(`/assistance?service=${encodeURIComponent(service.slug || service.title)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      id="serviceModal"
    >
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800 w-[92%] max-w-[650px] max-h-[90vh] overflow-y-auto custom-scrollbar p-6 z-10 animate-in zoom-in-95 duration-200 transition-colors">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Header */}
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <span className="badge-primary text-xs capitalize">
              {service.category_display || service.category}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              <i className="fa-solid fa-clock mr-1"></i> {service.processing_time || '24-48 hours'}
            </span>
          </div>
          <h3 className="text-2xl text-slate-900 dark:text-slate-100 font-bold">
            {service.title}
          </h3>
        </div>

        {/* Body */}
        <div className="py-6">
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-6">
            {service.description || service.short_description}
          </p>

          {/* Stats Bar */}
          {service.stats && (
            <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-xl p-4 mb-6">
              <div className="text-center">
                <span className="block text-xl font-bold text-blue-600 dark:text-blue-400">
                  {service.stats.value1 || service.processing_time || '24hrs'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {service.stats.label1 || 'Processing'}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {service.stats.value2 || service.fee || 'Free'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {service.stats.label2 || 'Fee'}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold text-amber-500">
                  {service.stats.value3 || service.rating || '4.9/5'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {service.stats.label3 || 'Rating'}
                </span>
              </div>
            </div>
          )}

          {/* Features */}
          {service.features && service.features.length > 0 && (
            <div className="mb-6">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
                <i className="fa-solid fa-star text-amber-400 mr-1.5"></i>Key Highlights
              </h4>
              <ul className="list-none p-0 flex flex-col gap-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                    <i className="fa-solid fa-circle-check text-emerald-500 text-base"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {service.requirements && service.requirements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
                <i className="fa-solid fa-clipboard-list text-blue-600 dark:text-blue-400 mr-1.5"></i>What You Need
              </h4>
              <ul className="list-none p-0 flex flex-col gap-2">
                {service.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                    <i className="fa-solid fa-arrow-right text-blue-600 dark:text-blue-400 text-xs"></i>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            onClick={handleApply}
          >
            <span>Request This Service</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
