export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white shadow-card p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtitle }) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-2 text-3xl font-extrabold text-lh-navy">{value}</h3>
      {subtitle ? <p className="mt-1 text-xs text-gray-400">{subtitle}</p> : null}
    </article>
  );
}
