// Función de cálculo unificada (exportada para usar en otros componentes)
export function calcularSemaforo(ftr, tiempo, noConformidades) {
  if (ftr >= 98 && tiempo <= 7 && noConformidades === 0) return 'VERDE';
  if (ftr >= 95 || tiempo <= 8 || noConformidades <= 2) return 'AMARILLO';
  return 'ROJO';
}

export default function SemaforoIndicator({ value, type = 'efectividad' }) {
  // Esta función se mantiene para compatibilidad, pero idealmente usar calcularSemaforo
  const getSemaforo = () => {
    if (type === 'efectividad') {
      if (value >= 98) return { color: 'bg-emerald-500', label: 'Excelente', text: 'text-emerald-600', bg: 'bg-emerald-50' };
      if (value >= 95) return { color: 'bg-amber-500', label: 'En desarrollo', text: 'text-amber-600', bg: 'bg-amber-50' };
      return { color: 'bg-red-500', label: 'Atención', text: 'text-red-600', bg: 'bg-red-50' };
    }
    if (type === 'tiempo') {
      if (value <= 7) return { color: 'bg-emerald-500', label: 'Excelente', text: 'text-emerald-600', bg: 'bg-emerald-50' };
      if (value <= 8) return { color: 'bg-amber-500', label: 'En desarrollo', text: 'text-amber-600', bg: 'bg-amber-50' };
      return { color: 'bg-red-500', label: 'Atención', text: 'text-red-600', bg: 'bg-red-50' };
    }
    if (type === 'conformidades') {
      if (value === 0) return { color: 'bg-emerald-500', label: 'Excelente', text: 'text-emerald-600', bg: 'bg-emerald-50' };
      if (value <= 2) return { color: 'bg-amber-500', label: 'En desarrollo', text: 'text-amber-600', bg: 'bg-amber-50' };
      return { color: 'bg-red-500', label: 'Atención', text: 'text-red-600', bg: 'bg-red-50' };
    }
    return { color: 'bg-slate-500', label: 'Sin datos', text: 'text-slate-600', bg: 'bg-slate-50' };
  };

  const semaforo = getSemaforo();

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${semaforo.color}`}></div>
      <span className={`text-xs font-bold ${semaforo.text} ${semaforo.bg} px-2 py-0.5 rounded`}>
        {semaforo.label}
      </span>
    </div>
  );
}
