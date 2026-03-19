const sizeClasses = {
  sm: "text-sm w-4 h-4",
  md: "text-base w-5 h-5",
  lg: "text-xl w-6 h-6",
};

const RatingStars = ({ rating = 0, size = "md", showValue = false }) => {
  const normalized = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  const cls = sizeClasses[size] || sizeClasses.md;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            className={`material-symbols-outlined ${cls} leading-none ${
              index < normalized ? "fill-1 text-amber-400" : "text-slate-300"
            }`}
            key={index}
          >
            star
          </span>
        ))}
      </span>
      {showValue ? (
        <span className="text-xs font-bold text-slate-600">{Number(rating).toFixed(1)}</span>
      ) : null}
    </span>
  );
};

export default RatingStars;
