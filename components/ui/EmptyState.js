export default function EmptyState({ periodo, tipo }) {
  return (
    <div className="bg-slate-50 rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
      <div className="text-5xl mb-3">📭</div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">Sin datos para {periodo}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        No hay información disponible para {tipo === 'semana' ? 'esta semana' : 'este período'}. 
        {tipo === 'semana' && ' Asegúrate de que el Google Sheet tenga datos para la semana seleccionada.'}
      </p>
    </div>
  );
}
