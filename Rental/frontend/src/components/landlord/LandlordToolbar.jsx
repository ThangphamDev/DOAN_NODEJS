const LandlordToolbar = ({ children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/60 ${className}`}>
    {children}
  </section>
);

export default LandlordToolbar;
