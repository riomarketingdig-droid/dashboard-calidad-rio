export default function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div className="animate-pulse">
      {/* Encabezado */}
      <div className="bg-slate-200 h-10 rounded-t-lg mb-2"></div>
      
      {/* Filas */}
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          {Array(columns).fill(0).map((_, j) => (
            <div key={j} className="bg-slate-100 h-8 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}
