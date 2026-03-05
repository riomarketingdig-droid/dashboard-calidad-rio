export default function ResumenNiveles({ recomendaciones }) {
  const conteo = {
    URGENTE: recomendaciones.filter(r => r.nivel === 'URGENTE').length,
    CRÍTICO: recomendaciones.filter(r => r.nivel === 'CRÍTICO').length,
    ALTO: recomendaciones.filter(r => r.nivel === 'ALTO').length,
    VERDE: recomendaciones.filter(r => r.nivel === 'VERDE').length
  };

  const planesAccion = {
    URGENTE: { accion: 'Intervención diaria', seguimiento: 'Cada 3 días', meta: 'Subir a amarillo en 2 semanas' },
    CRÍTICO: { accion: 'Coaching intensivo', seguimiento: 'Semanal', meta: 'Subir a amarillo en 3 semanas' },
    ALTO: { accion: 'Coaching semanal', seguimiento: 'Quincenal', meta: 'Subir a verde en 1 mes' },
    VERDE: { accion: 'Mentoría a otros', seguimiento: 'Mensual', meta: 'Mantener y compartir' }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
      <h3 className="text-sm font-bold text-slate-800 mb-3">📊 PLANES DE ACCIÓN POR NIVEL</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {Object.entries(conteo).map(([nivel, cantidad]) => (
          <div key={nivel} className={`p-3 rounded-lg ${
            nivel === 'URGENTE' ? 'bg-red-50 border-red-200' :
            nivel === 'CRÍTICO' ? 'bg-orange-50 border-orange-200' :
            nivel === 'ALTO' ? 'bg-amber-50 border-amber-200' :
            'bg-emerald-50 border-emerald-200'
          } border`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black uppercase">{nivel}</span>
              <span className={`text-sm font-bold ${
                nivel === 'URGENTE' ? 'text-red-600' :
                nivel === 'CRÍTICO' ? 'text-orange-600' :
                nivel === 'ALTO' ? 'text-amber-600' :
                'text-emerald-600'
              }`}>{cantidad}</span>
            </div>
            <p className="text-[10px] font-medium">{planesAccion[nivel].accion}</p>
            <p className="text-[9px] text-slate-500 mt-1">{planesAccion[nivel].meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
