"use client";

import React, { useState } from "react";
import { Truck, IndianRupee, PackageCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCRAP_RATES } from "@/constants/mock-data";

export default function ScrapPickupModal({ isOpen, onClose }) {
  const [selectedItems, setSelectedItems] = useState({
    cardboard: 5, // default 5kg
    plastic: 2,
    paper: 3,
    metal: 0,
    "e-waste": 0,
  });

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("morning");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [bookingId, setBookingId] = useState("");


  const calculateTotalValue = () => {
    let total = 0;
    Object.entries(selectedItems).forEach(([cat, kg]) => {
      const rate = SCRAP_RATES[cat] || 0;
      total += (Number(kg) || 0) * rate;
    });
    return total.toFixed(2);
  };

  const handleWeightChange = (category, val) => {
    setSelectedItems((prev) => ({
      ...prev,
      [category]: Math.max(0, Number(val) || 0),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = `ECO-PICKUP-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(id);
    setIsBooked(true);
  };

  const handleReset = () => {
    setIsBooked(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full p-1"
        >
          <X className="h-5 w-5" />
        </button>

        {isBooked ? (
          <div className="py-6 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <PackageCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Doorstep Pickup Scheduled!
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              A certified local scrap collector has been assigned. You will receive an SMS confirmation with their arrival ETA.
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 text-left max-w-sm mx-auto space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Booking Reference:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{bookingId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Estimated Cash Value:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{calculateTotalValue()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Slot:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{timeSlot.toUpperCase()} (Next Available)</span>
              </div>
            </div>
            <Button onClick={handleReset} className="w-full">
              Done & Return to Dashboard
            </Button>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Truck className="h-4 w-4" />
                <span>Doorstep Scrap Collector (&quot;Kabadiwala&quot;)</span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                Schedule Doorstep Scrap Pickup
              </h2>
              <p className="text-xs text-muted-foreground">
                Get recyclables weighed at your doorstep and receive instant UPI or cash payout.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category weight selectors */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Select Recyclables & Approximate Weight (KG)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: "cardboard", label: "Cardboard", rate: SCRAP_RATES.cardboard },
                    { key: "paper", label: "Newspaper/Paper", rate: SCRAP_RATES.paper },
                    { key: "plastic", label: "Plastics", rate: SCRAP_RATES.plastic },
                    { key: "metal", label: "Metal / Iron", rate: SCRAP_RATES.metal },
                    { key: "e-waste", label: "E-Waste / Cables", rate: SCRAP_RATES["e-waste"] },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.label}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">₹{item.rate}/kg</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={selectedItems[item.key] || 0}
                          onChange={(e) => handleWeightChange(item.key, e.target.value)}
                          className="h-8 text-xs text-center"
                        />
                        <span className="text-xs text-zinc-400 font-bold">kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total payout preview */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Estimated Cash Payment</div>
                    <div className="text-[10px] text-zinc-400">Final price verified on electronic scale</div>
                  </div>
                </div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{calculateTotalValue()}
                </div>
              </div>

              {/* Date and Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Preferred Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 text-xs text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (1:00 PM - 4:00 PM)</option>
                    <option value="evening">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Address and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Pickup Street Address
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Flat / House No, Street, Indiranagar"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Contact Mobile Number
                  </label>
                  <Input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} size="sm">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Confirm Doorstep Pickup
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
