import React, { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import API from '../../services/api';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  
  // Add / Edit State
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('flat');
  const [discountValue, setDiscountValue] = useState(150);
  const [bankPartner, setBankPartner] = useState('VIP Exclusive');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = () => {
    API.get('/coupons').then(res => setCoupons(res.data)).catch(() => {});
  };

  const handleCreateOrUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !title) return;

    try {
      if (editingCoupon) {
        // Edit Operation
        const res = await API.put(`/coupons/${editingCoupon.id}`, {
          code: code.toUpperCase(),
          title,
          description,
          discountType,
          discountValue: Number(discountValue),
          bankPartner
        });
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? res.data : c));
        setEditingCoupon(null);
      } else {
        // Add Operation
        const res = await API.post('/coupons', {
          code: code.toUpperCase(),
          title,
          description,
          discountType,
          discountValue: Number(discountValue),
          minAmount: 500,
          expiryDate: "2026-12-31",
          bankPartner
        });
        setCoupons([res.data, ...coupons]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setTitle(coupon.title);
    setDescription(coupon.description);
    setDiscountType(coupon.discountType || 'flat');
    setDiscountValue(coupon.discountValue);
    setBankPartner(coupon.bankPartner || 'VIP Exclusive');
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      await API.delete(`/coupons/${id}`);
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setCode('');
    setTitle('');
    setDescription('');
    setDiscountValue(150);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Targeted Coupon Engine</h1>
        <p className="text-xs text-slate-400">Manage promotional codes with full Add, Edit, and Delete controls.</p>
      </div>

      {/* FORM: ADD / EDIT COUPON */}
      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-white">
            {editingCoupon ? `Edit Promo Code: ${editingCoupon.code}` : 'Generate Custom Promo Code'}
          </h3>
          {editingCoupon && (
            <button onClick={resetForm} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleCreateOrUpdateCoupon} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Coupon Code (e.g. PRIME300)"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="p-3 rounded-xl glass-input text-xs font-mono uppercase"
            />
            <input
              type="text"
              required
              placeholder="Offer Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="p-3 rounded-xl glass-input text-xs"
            />
            <input
              type="text"
              placeholder="Bank / Partner Label"
              value={bankPartner}
              onChange={e => setBankPartner(e.target.value)}
              className="p-3 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={discountType}
              onChange={e => setDiscountType(e.target.value)}
              className="p-3 rounded-xl glass-input text-xs font-semibold"
            >
              <option value="flat" className="bg-[#0c0d14]">Flat Cashback / Discount (₹)</option>
              <option value="percentage" className="bg-[#0c0d14]">Percentage Discount (%)</option>
            </select>
            <input
              type="number"
              placeholder="Discount Value"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              className="p-3 rounded-xl glass-input text-xs"
            />
          </div>

          <textarea
            rows={2}
            placeholder="Description details..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl glass-input text-xs"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs glow-cyan cursor-pointer"
          >
            {editingCoupon ? 'Save Coupon Updates' : 'Create & Dispatch Promo Coupon'}
          </button>
        </form>
      </div>

      {/* ACTIVE COUPONS LIST */}
      <div className="p-6 rounded-3xl glass-panel border-white/10 space-y-4">
        <h3 className="font-serif text-xl font-bold text-white">Active Promo Registry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl glass-panel border-white/5 space-y-2 text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {c.discountType === 'flat' ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                  </span>
                </div>
                <p className="font-bold text-white mt-1">{c.title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{c.description}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditClick(c)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold hover:bg-cyan-500 hover:text-black transition-all cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCoupon(c.id)}
                  className="px-3 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
