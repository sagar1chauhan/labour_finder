import React from 'react';
import { FiCheckCircle, FiShield, FiAlertCircle, FiPackage, FiPlusCircle, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentVerificationModal = ({ isOpen, onClose, booking, onPayOnline }) => {
  if (!isOpen || !booking) return null;

  // Calculate totals matching Vendor Billing logic
  const originalBase = parseFloat(booking.basePrice) || 0;
  const originalGST = (originalBase * 18) / 100;
  const baseAmount = originalBase; // Alias for legacy support

  // Extra Services & Parts from vendor bill
  const services = booking.bill?.services || [];
  const parts = booking.bill?.parts || [];
  const customItems = booking.bill?.customItems || [];

  let extraServiceBase = 0;
  let extraServiceGST = 0;
  services.forEach(s => {
    const total = s.total || 0;
    const base = total / 1.18;
    const gst = total - base;
    extraServiceBase += base;
    extraServiceGST += gst;
  });

  let partsBase = 0;
  let partsGST = 0;
  parts.forEach(p => {
    partsBase += ((p.price || 0) * (p.quantity || 1));
    partsGST += (p.gstAmount || 0);
  });
  customItems.forEach(c => {
    partsBase += ((c.price || 0) * (c.quantity || 1));
    partsGST += (c.gstAmount || 0);
  });

  const totalGST = originalGST + extraServiceGST + partsGST;
  const finalTotal = (originalBase + originalGST) + (extraServiceBase + extraServiceGST) + (partsBase + partsGST);

  const isPlanBenefit = booking.paymentMethod === 'plan_benefit';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative h-24 bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-10 translate-y-10" />
            </div>
            <div className="relative z-10 text-center flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-black text-lg tracking-tight">Payment & Verification</h3>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={onClose}
                title="Minimize"
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-colors border border-white/20"
              >
                <div className="w-5 h-1 bg-white rounded-full opacity-60"></div>
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-colors border border-white/20"
              >
                <FiX className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {/* Price Breakdown Section */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Total Payable</h4>
                <p className="text-3xl font-black text-gray-900">₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">

                {/* 1. Services Section */}
                <div>
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" /> Services
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Original Booking</span>
                      {isPlanBenefit ? (
                        <div className="flex items-center gap-1">
                          <span className="line-through text-gray-400">₹{originalBase.toFixed(2)}</span>
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">FREE</span>
                        </div>
                      ) : (
                        <span className="font-bold">₹{originalBase.toFixed(2)}</span>
                      )}
                    </div>
                    {services.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-gray-600 pl-2 border-l-2 border-gray-200">
                        <span>{s.name} <span className="text-gray-400">x{s.quantity}</span></span>
                        <span className="font-mono">₹{(s.total / 1.18).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200 border-dashed">
                      <span>Total Service Base</span>
                      <span>₹{(originalBase + extraServiceBase).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Parts Section */}
                {(parts.length > 0 || customItems.length > 0) && (
                  <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 mt-4">
                      <FiPackage className="w-3 h-3" /> Parts & Material
                    </h5>
                    <div className="space-y-2 text-xs">
                      {parts.map((p, idx) => (
                        <div key={`p-${idx}`} className="flex justify-between text-gray-600">
                          <span>{p.name} <span className="text-gray-400">x{p.quantity}</span></span>
                          <span className="font-mono">₹{(p.price * p.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {customItems.map((c, idx) => (
                        <div key={`c-${idx}`} className="flex justify-between text-gray-600">
                          <div>
                            <span>{c.name} <span className="text-gray-400">x{c.quantity}</span></span>
                            {c.hsnCode && <span className="text-[8px] block text-gray-400">HSN: {c.hsnCode}</span>}
                          </div>
                          <span className="font-mono">₹{(c.price * c.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200 border-dashed">
                        <span>Total Parts Base</span>
                        <span>₹{partsBase.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Taxes */}
                <div>
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1 mt-4">
                    <FiAlertCircle className="w-3 h-3" /> Taxes
                  </h5>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Total GST (18%)</span>
                    {isPlanBenefit && totalGST === 0 ? (
                      <span className="text-emerald-600 font-bold">Included</span>
                    ) : (
                      <span className="font-mono">₹{totalGST.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Final Total */}
                <div className="pt-4 border-t-2 border-dashed border-gray-200 mt-2 flex justify-between items-center">
                  <span className="text-sm font-black text-gray-900">Grand Total</span>
                  <span className="text-xl font-black text-teal-700">₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <h4 className="text-xs font-black text-gray-900 uppercase mb-3">Finalize Payment</h4>

            <div className="space-y-4">
              {booking.paymentStatus === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center shadow-inner">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
                    <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-900 mb-1">Payment Successful!</h4>
                  <p className="text-xs text-emerald-600 font-medium">Your online payment of ₹{finalTotal.toLocaleString()} has been verified.</p>
                </div>
              ) : (
                <>
                  {/* Option 2: Online */}
                  <button
                    onClick={onPayOnline}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-teal-200 active:scale-[0.98] transition-all hover:shadow-teal-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                    <span className="relative">Pay Online Now</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black tracking-tight">FAST & SECURE</span>
                  </button>

                  <div className="relative py-1 text-center">
                    <span className="text-[10px] text-gray-400 font-bold bg-white px-3 relative z-10 uppercase tracking-widest">OR</span>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100 z-0"></div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center relative overflow-hidden">
                    <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">Cash Payment</p>
                    <p className="text-[10px] text-slate-500 mb-3 opacity-80 leading-relaxed">
                      Pay cash to the professional. Share this code to complete validation:
                    </p>

                    {(booking.customerConfirmationOTP || booking.paymentOtp) && (
                      <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-3 mb-2 flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Verification Code</span>
                        <span className="text-3xl font-mono font-black text-slate-800 tracking-widest">
                          {booking.customerConfirmationOTP || booking.paymentOtp}
                        </span>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 italic">
                      Only pay after work satisfaction.
                    </p>
                  </div>
                </>
              )}
            </div>

            <button onClick={onClose} className="w-full mt-6 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentVerificationModal;
