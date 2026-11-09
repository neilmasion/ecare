import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getServices, getStats, getTestimonials, getFAQs } from '../api/client';
import ServiceModal from '../components/ServiceModal';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    requests_assisted: 2430,
    response_rate: 98,
    avg_response_time_minutes: 15,
  });
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [quickRef, setQuickRef] = useState('');

  useEffect(() => {
    getStats().then(res => setStats(res.data)).catch(() => {});
    getServices().then(res => setServices(res.data.slice(0, 6))).catch(() => {});
    getTestimonials().then(res => setTestimonials(res.data)).catch(() => {});
    getFAQs().then(res => setFaqs(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (!quickRef.trim()) return;
    navigate(`/track?ref=${encodeURIComponent(quickRef.trim())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200/60 py-10 sm:py-16 px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Official Community E-Services &amp; Public Assistance Portal</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Public Services &amp; Assistance, <br />
            <span className="gradient-text">Simple and Accessible</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Request clearances, apply for financial and medical aid, and track government services online without standing in line.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
            <Link to="/assistance" className="btn-primary text-base px-6 py-3 shadow-md shadow-blue-500/20">
              <i className="fa-solid fa-hand-holding-hand"></i>
              <span>Request Assistance</span>
            </Link>
            <Link to="/services" className="btn-outline text-base px-6 py-3">
              <span>Browse All Services</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </Link>
          </div>

          {/* Quick Tracking Card */}
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm shadow-slate-200/50">
            <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Have a Reference Number? (e.g. CC-2026-2584)"
                  value={quickRef}
                  onChange={(e) => setQuickRef(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <button type="submit" className="btn-primary py-2.5 px-5 whitespace-nowrap">
                Track Application
              </button>
            </form>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12 pt-8 border-t border-slate-200/60">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.requests_assisted.toLocaleString()}+
              </div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mt-1">
                Citizens Assisted
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {stats.avg_response_time_minutes} Minutes
              </div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mt-1">
                Average Triage Time
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {stats.response_rate}%
              </div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mt-1">
                Resolution Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 page-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 mb-2">
            How Community eCare Works
          </h2>
          <p className="text-slate-600 text-sm">
            Fast, transparent, and completely digital from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center relative hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-blue-100">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Choose Your Service</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Select from barangay clearances, medical financial subsidies, emergency aid, or official appointments.
            </p>
          </div>

          <div className="card text-center relative hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Online</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fill out the 3-minute form with basic resident details and attach any supporting documents.
            </p>
          </div>

          <div className="card text-center relative hover:border-blue-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Track &amp; Receive</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Get an instant Reference Number to follow approval status live. Receive documents or aid directly.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 bg-white border-y border-slate-200/60 px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Featured Programs
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Frequently Requested Services
              </h2>
            </div>
            <Link to="/services" className="btn-outline text-xs py-2 px-4 self-start sm:self-auto">
              <span>View All Programs</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id || service.slug}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge-primary text-[11px] uppercase tracking-wider">
                    {service.category_display || service.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    <i className="fa-regular fa-clock mr-1 text-slate-400"></i>
                    {service.processing_time || '24-48 hrs'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
                  {service.short_description || service.description}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <span className="text-xs font-semibold text-slate-700">
                    Fee: <strong className="text-blue-600">{service.fee || 'Free'}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedService(service)}
                    className="btn-outline py-1.5 px-3 text-xs"
                  >
                    Details &amp; Requirements
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Assistance Banner */}
      <section className="py-12 page-container">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-slate-900/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>Emergency Citizen Helpline</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Need Urgent Medical or Disaster Assistance?
            </h3>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Our 24/7 emergency response team coordinates ambulance dispatch, immediate hospital guarantees, and disaster relief.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href="tel:911"
              className="btn-danger py-3 px-6 text-sm flex-1 md:flex-none justify-center shadow-md shadow-rose-600/30"
            >
              <i className="fa-solid fa-phone"></i>
              <span>Call 911 Hotline</span>
            </a>
            <Link
              to="/assistance?service=emergency"
              className="btn-outline border-white/20 text-white bg-white/10 hover:bg-white/20 py-3 px-5 text-sm flex-1 md:flex-none justify-center"
            >
              <span>Emergency Aid Form</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Citizen Feedback Carousel */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-slate-100/70 border-t border-slate-200/60 px-6 sm:px-12 lg:px-16 xl:px-24">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Citizen Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 mb-8">
              Trusted by Local Residents
            </h2>

            <div className="card text-center p-8 relative">
              <div className="flex justify-center gap-1 text-amber-400 text-sm mb-4">
                {'★'.repeat(testimonials[activeTestimonial].rating)}
              </div>
              <p className="text-slate-700 text-base italic leading-relaxed mb-6">
                "{testimonials[activeTestimonial].comment}"
              </p>
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {testimonials[activeTestimonial].name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {testimonials[activeTestimonial].role}
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeTestimonial === i ? 'bg-blue-600 w-6' : 'bg-slate-300'
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion */}
      {faqs.length > 0 && (
        <section className="py-16 page-container-narrow">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Help Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={faq.id || index}
                  className="card p-0 overflow-hidden border border-slate-200"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <i
                      className={`fa-solid ${
                        isOpen ? 'fa-minus text-blue-600' : 'fa-plus text-slate-400'
                      } text-xs transition-transform`}
                    ></i>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Service Modal */}
      <ServiceModal
        service={selectedService}
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
      />
    </div>
  );
};

export default Home;
