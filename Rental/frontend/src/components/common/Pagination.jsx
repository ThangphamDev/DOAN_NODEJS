const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
  pageSize = 5,
  pageSizeOptions = [5, 10, 20],
  onPageSizeChange,
  totalItems,
}) => {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const shouldRenderPagination = totalPages > 1;
  const shouldRenderPageSize = typeof onPageSizeChange === "function";

  if (!shouldRenderPagination && !shouldRenderPageSize) return null;

  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/60 md:flex-row md:items-center md:justify-between ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {shouldRenderPageSize ? (
          <>
            <span className="text-sm font-medium text-slate-500">Hiển thị mỗi trang:</span>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
              {pageSizeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onPageSizeChange(option)}
                  className={`inline-flex h-9 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${
                    pageSize === option
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "text-slate-600 hover:bg-white hover:text-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {typeof totalItems === "number" ? (
          <span className="text-sm text-slate-400">
            Tổng cộng: <span className="font-semibold text-slate-600">{totalItems}</span>
          </span>
        ) : null}
      </div>

      {shouldRenderPagination ? (
        <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </button>

          {pages.map((page) => (
            <button
              className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                currentPage === page
                  ? "border-primary bg-primary text-white shadow-sm shadow-primary/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
              }`}
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Pagination;
