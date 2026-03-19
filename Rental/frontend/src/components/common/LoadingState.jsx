const shimmer = `
  relative overflow-hidden before:absolute before:inset-0
  before:-translate-x-full before:animate-[shimmer_1.4s_infinite]
  before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent
`;

const SkeletonBar = ({ className = "" }) => (
  <div className={`rounded bg-slate-200 ${shimmer} ${className}`} />
);

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
    <div className={`h-48 w-full bg-slate-200 ${shimmer}`} />
    <div className="space-y-3 p-4">
      <SkeletonBar className="h-4 w-2/3" />
      <SkeletonBar className="h-3 w-full" />
      <SkeletonBar className="h-3 w-4/5" />
      <div className="flex items-center justify-between pt-2">
        <SkeletonBar className="h-5 w-1/3" />
        <SkeletonBar className="h-8 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

const SkeletonListRow = () => (
  <div className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className={`h-24 w-32 shrink-0 rounded-lg bg-slate-200 ${shimmer}`} />
    <div className="flex-1 space-y-3 py-1">
      <SkeletonBar className="h-4 w-3/4" />
      <SkeletonBar className="h-3 w-1/2" />
      <SkeletonBar className="h-3 w-2/3" />
    </div>
  </div>
);

const LoadingState = ({ variant = "grid", count = 6 }) => {
  if (variant === "list") {
    return (
      <>
      <style>{`
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
      <div className="space-y-3">
        {Array.from({ length: count }, (_, i) => <SkeletonListRow key={i} />)}
      </div>
      </>
    );
  }

  if (variant === "full") {
    return (
      <>
        <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16">
          <div className={`h-12 w-12 rounded-full bg-slate-200 ${shimmer}`} />
          <SkeletonBar className="h-3 w-32" />
          <SkeletonBar className="h-3 w-24" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    </>
  );
};

export default LoadingState;
