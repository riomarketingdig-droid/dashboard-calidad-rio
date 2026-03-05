import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Upload() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const mapCSVToAgent = (row) => ({
    agent_id: row.agent_id || row.AgentID || row.id,
    full_name: row.full_name || row.agent_name || row.AgentName || row.name,
    team: row.team || row.Team || row.equipo,
    is_active: true
  });

  const mapCSVToMetrics = (row) => ({
    agent_id: row.agent_id || row.AgentID || row.id,
    date: row.date || row.Date || row.fecha,
    calls_handled: parseInt(row.calls_handled || row.CallsHandled || row.llamadas || 0),
    avg_handle_time: parseFloat(row.avg_handle_time || row.AvgHandleTime || row.tiempo_promedio || 0),
    satisfaction_score: parseFloat(row.satisfaction_score || row.SatisfactionScore || row.satisfaccion || 0),
    resolution_rate: parseFloat(row.resolution_rate || row.ResolutionRate || row.resolucion || 0),
    value_capture_rate: parseFloat(row.value_capture_rate || row.ValueCaptureRate || 0),
    closing_rate: parseFloat(row.closing_rate || row.ClosingRate || 0),
    opps_per_hour: parseFloat(row.opps_per_hour || row.OppsPerHour || 0),
    tier: row.tier || 'C'
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data;
          setProgress({ current: 0, total: rows.length });

          const BATCH_SIZE = 50;
          let agentsProcessed = 0;
          let metricsProcessed = 0;

          for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            
            const agents = batch.map(row => mapCSVToAgent(row));
            const metrics = batch.map(row => mapCSVToMetrics(row));

            // Insertar agents
            const { error: agentsError } = await supabase
              .from('agents')
              .upsert(agents, {
                onConflict: 'agent_id',
                ignoreDuplicates: false
              });

            if (agentsError) throw agentsError;
            agentsProcessed += agents.length;

            // Insertar performance_metrics
            const { error: metricsError } = await supabase
              .from('performance_metrics')
              .insert(metrics);

            if (metricsError) throw metricsError;
            metricsProcessed += metrics.length;

            setProgress({ current: i + batch.length, total: rows.length });
          }

          // Activar el engine RPC
          const { error: rpcError } = await supabase
            .rpc('calculate_agent_tiers');

          if (rpcError) throw rpcError;

          setResults({
            success: true,
            totalProcessed: rows.length,
            agentsUpdated: agentsProcessed,
            metricsAdded: metricsProcessed
          });

        } catch (err) {
          console.error('Error:', err);
          setError(err.message);
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        setError(error.message);
        setUploading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* Header (mismo estilo que index) */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <img src="/Logotipo RIO a color.png" alt="Logo RIO" className="h-14 w-auto object-contain" />
          <div className="border-l pl-4 border-slate-200">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
              Carga de Datos
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1 tracking-widest uppercase">
              Import CSV
            </p>
          </div>
        </div>
        
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-bold"
        >
          ← Volver al Dashboard
        </button>
      </header>

      {/* Tarjeta de carga */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Subir Archivo CSV
        </h2>
        
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className={`cursor-pointer inline-flex items-center px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-bold ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Subiendo...' : 'Seleccionar CSV'}
          </label>
          <p className="mt-3 text-sm text-slate-500">
            Formatos aceptados: .csv con headers
          </p>
        </div>

        {/* Barra de progreso */}
        {uploading && progress.total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Procesando...</span>
              <span className="font-bold">{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-slate-800 rounded-full h-2 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {results && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-emerald-800 mb-4">
            ✓ Carga Exitosa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
              <div className="text-2xl font-black text-emerald-600">
                {results.totalProcessed}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Registros</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
              <div className="text-2xl font-black text-blue-600">
                {results.agentsUpdated}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Agentes</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
              <div className="text-2xl font-black text-purple-600">
                {results.metricsAdded}
              </div>
              <div className="text-xs text-slate-500 font-bold uppercase mt-1">Métricas</div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mt-4">
          <p className="text-red-800 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4">
          📋 Formato del CSV
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-blue-700 mb-2 text-sm uppercase">Tabla agents:</h4>
            <ul className="space-y-1 text-sm text-blue-600">
              <li>• agent_id (obligatorio)</li>
              <li>• full_name (obligatorio)</li>
              <li>• team (opcional)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-blue-700 mb-2 text-sm uppercase">Tabla performance_metrics:</h4>
            <ul className="space-y-1 text-sm text-blue-600">
              <li>• date (obligatorio, YYYY-MM-DD)</li>
              <li>• calls_handled (obligatorio)</li>
              <li>• avg_handle_time (obligatorio)</li>
              <li>• satisfaction_score (obligatorio)</li>
              <li>• resolution_rate (obligatorio)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
