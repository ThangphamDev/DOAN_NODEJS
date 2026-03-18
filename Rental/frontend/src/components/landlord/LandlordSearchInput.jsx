const LandlordSearchInput = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className = "",
}) => (
  <label className={`relative block w-full ${className}`}>
    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      search
    </span>
    <input
      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 shadow-sm shadow-slate-100/70 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
      placeholder={placeholder}
      type="text"
      value={value}
      onChange={onChange}
    />
  </label>
);

export default LandlordSearchInput;
