import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedDate, setSelectedDate] = useState("2026-07-27");
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [lastBooking, setLastBooking] = useState(null);

  const resetBooking = () => {
    setSelectedShow(null);
    setSelectedSeats([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const calculateTotal = () => {
    if (!selectedShow || selectedSeats.length === 0) return { base: 0, fee: 0, tax: 0, total: 0, final: 0 };
    
    // Tiered calculation
    let base = 0;
    selectedSeats.forEach(seat => {
      const row = seat.charAt(0);
      let price = selectedShow.prices?.Normal || 300;
      if (row === 'A' || row === 'B') price = selectedShow.prices?.Recliner || 650;
      else if (row === 'C' || row === 'D') price = selectedShow.prices?.VIP || 500;
      else if (row === 'E' || row === 'F') price = selectedShow.prices?.Premium || 420;
      base += price;
    });

    const fee = Math.round(base * 0.08); // 8% convenience fee
    const tax = Math.round((base + fee) * 0.18); // 18% GST
    const total = base + fee + tax;
    const final = Math.max(0, total - discountAmount);

    return { base, fee, tax, total, final };
  };

  return (
    <BookingContext.Provider value={{
      selectedCity,
      setSelectedCity,
      selectedDate,
      setSelectedDate,
      selectedShow,
      setSelectedShow,
      selectedSeats,
      setSelectedSeats,
      appliedCoupon,
      setAppliedCoupon,
      discountAmount,
      setDiscountAmount,
      lastBooking,
      setLastBooking,
      resetBooking,
      calculateTotal
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
