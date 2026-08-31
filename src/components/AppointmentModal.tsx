import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle, 
  ShieldCheck 
} from 'lucide-react';
import { JewelryProduct, SiteSettings } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: JewelryProduct | null;
  settings: SiteSettings;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
  settings,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('03:00 PM - 05:00 PM');
  const [occasion, setOccasion] = useState('Bridal / Wedding');
  const [isBooked, setIsBooked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date) {
      alert('Please fill in Name, Phone, and preferred Date');
      return;
    }
    setIsBooked(true);
  };

  const handleSendWhatsAppAppointment = () => {
    const text = `*✨ VIP BOUTIQUE TRIAL APPOINTMENT ✨*%0A%0A` +
      `*Customer Name:* ${name}%0A` +
      `*Phone Number:* ${phone}%0A` +
      `*Preferred Date:* ${date}%0A` +
      `*Time Slot:* ${timeSlot}%0A` +
      `*Occasion:* ${occasion}%0A` +
      (selectedProduct ? `*Interested Piece:* ${selectedProduct.name} (${selectedProduct.sku})%0A` : '') +
      `*Showroom Location:* HALDWANI NANDA VIHAR . PHASE -I%0A%0A` +
      `Please confirm my private viewing slot!`;
    window.open(`https://wa.me/91${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#C59B27]/40 space-y-5 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-black hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isBooked ? (
          <div className="text-center py-6 space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#996515]">
                PRIVATE VIEWING REGISTERED
              </span>
              <h3 className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#081816]">
                Appointment Booked, {name}!
              </h3>
              <p className="text-stone-600">
                Our master jeweler will be expecting you on <strong>{date}</strong> ({timeSlot}) at the Haldwani Nanda Vihar boutique.
              </p>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8D5B5] text-left space-y-1">
              <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                <MapPin className="w-4 h-4 text-[#996515]" />
                <span>HALDWANI NANDA VIHAR . PHASE -I</span>
              </div>
              <p className="text-stone-500 text-[11px] pl-5">
                Helpline: 7668037278 • Timings: 10:30 AM - 8:30 PM
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleSendWhatsAppAppointment}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm Appointment on WhatsApp</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition font-bold uppercase tracking-wider text-[10px]"
              >
                Back To Main Menu
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1 border-b border-[#E8D5B5] pb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8D5B5]/60 text-[#996515] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#C59B27]" />
                PRIVATE SHOWROOM EXPERIENCE
              </div>
              <h3 className="text-xl font-serif-luxury font-bold text-[#081816]">
                Book VIP Jewelry Viewing
              </h3>
              <p className="text-stone-600 text-xs">
                Enjoy an exclusive lounge trial with our master design consultants at Haldwani Nanda Vihar.
              </p>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8D5B5] flex items-center gap-3">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                />
                <div>
                  <span className="text-[10px] font-bold text-[#996515] uppercase">Selected Piece</span>
                  <h4 className="font-bold text-stone-900 truncate max-w-[240px]">{selectedProduct.name}</h4>
                  <span className="text-stone-500 text-[10px]">{selectedProduct.purity} • {selectedProduct.grossWeight}g</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Pandey"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">WhatsApp / Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 7668037278"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Time Slot *</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  >
                    <option value="11:00 AM - 01:00 PM">Morning (11 AM - 1 PM)</option>
                    <option value="01:00 PM - 03:00 PM">Afternoon (1 PM - 3 PM)</option>
                    <option value="03:00 PM - 05:00 PM">Evening (3 PM - 5 PM)</option>
                    <option value="05:00 PM - 08:00 PM">Sunset VIP (5 PM - 8 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Shopping Occasion</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                >
                  <option value="Bridal / Wedding">Bridal / Wedding Jewellery</option>
                  <option value="Engagement Solitaire">Engagement / Solitaire Ring</option>
                  <option value="Festive Gold">Festive & Temple Gold</option>
                  <option value="Daily Luxury Wear">Daily Luxury Wear</option>
                  <option value="Auspicious Gifting">Auspicious Gifting & Silver</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold uppercase text-xs tracking-wider hover:bg-stone-50 text-center"
              >
                Back To Main Menu
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#081816] text-[#DFB76C] font-bold text-xs uppercase tracking-wider hover:bg-[#122e2a] transition shadow-md text-center"
              >
                Reserve VIP Slot
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
