export default function TarjetaRecomendacion({ recomendacion }) {
  const coloresNivel = {
    URGENTE: 'bg-red-600',
    CRÍTICO: 'bg-orange-500',
    ALTO: 'bg-amber-500',
    VERDE: 'bg-emerald-500'
  };

  const fondosNivel = {
    URGENTE: 'bg-red-50 border-red-200',
    CRÍTICO: 'bg-orange-50 border-orange-200',
    ALTO: 'bg-amber-50 border-amber-200',
    VERDE: 'bg-emerald-50 border-emerald-200'
  };

  return (
    <div className={`${fondosNivel[recomendacion.nivel]} rounded-xl p-4 border mb-3`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${coloresNivel[recomendacion.nivel]}`}></span>
          <span className="text-xs font-black uppercase">{recomendacion.nivel}</span>
        </div>
        <span className="text-[10px] bg-white px-2 py-1 rounded-full border">
          {recomendacion.area}
        </span>
      </div>
      
      <h4 className="font-bold text-slate-800 mb-1">{recomendacion.agente}</h4>
      <p className="text-xs text-slate-600 mb-2">{recomendacion.metrica}</p>
      
      <div className="bg-white/50 rounded-lg p-3 mb-2">
        <p className="text-sm font-medium mb-1">▶ {recomendacion.sugerencia}</p>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>👤 {recomendacion.responsable}</span>
          <span>⏱️ {recomendacion.plazo}</span>
        </div>
      </div>
      
      <div className="text-[10px] text-slate-500 flex justify-between items-center">
        <span>📅 Límite: {recomendacion.fechaLimite}</span>
        <span className="font-mono">{recomendacion.id}</span>
      </div>
    </div>
  );
}
