// /pages/upload.js
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

  // Mapeo de columnas del CSV a las tablas de Supabase
  const mapCSVToAgent = (row) => ({
    agent_id: row.agent_id || row.AgentID || row.id,
    agent_name: row.agent_name || row.AgentName || row.name,
    team: row.team || row.Team || row.equipo,
    is_active: true
  });

  const mapCSVToMetrics = (row) => ({
    agent_id: row.agent_id || row.AgentID || row.id,
    date: row.date || row.Date || row.fecha,
    calls_handled: parseInt(row.calls_handled || row.CallsHandled || row.llamadas || 0),
    avg_handle_time: parseFloat(row.avg_handle_time || row.AvgHandleTime || row.tiempo_promedio || 0),
    satisfaction_score: parseFloat(row.satisfaction_score || row.SatisfactionScore || row.satisfaccion || 0),
    resolution_rate: parseFloat(row.resolution_rate || row.ResolutionRate || row.resolucion || 0)
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

          // Procesar en lotes para no sobrecargar la API
          const BATCH_SIZE = 50;
          const agents = [];
          const metrics = [];

          for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            
            // Mapear datos del lote actual
            batch.forEach(row => {
              agents.push(mapCSVToAgent(row));
              metrics.push(mapCSVToMetrics(row));
            });

            // Insertar agents (evitando duplicados)
            const { error: agentsError } = await supabase
              .from('agents')
              .upsert(agents.slice(-batch.length), {
                onConflict: 'agent_id',
                ignoreDuplicates: false
              });

            if (agentsError) throw agentsError;

            // Insertar performance_metrics
            const { error: metricsError } = await supabase
              .from('performance_metrics')
              .insert(metrics.slice(-batch.length));

            if (metricsError) throw metricsError;

            setProgress({ current: i + batch.length, total: rows.length });
          }

          // Activar el engine RPC para recalcular los tiers
          const { error: rpcError } = await supabase
            .rpc('calculate_agent_tiers');

          if (rpcError) throw rpcError;

          setResults({
            success: true,
            totalProcessed: rows.length,
            agentsUpdated: agents.length,
            metricsAdded: metrics.length
          });

        } catch (err) {
          console.error('Error processing data:', err);
          setError(err.message);
        } finally {
          setUploading(false);
          setProgress({ current: 0, total: 0 });
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError(error.message);
        setUploading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con navegación */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Carga de Datos
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Tarjeta de carga (mismo estilo que el index) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Subir Archivo CSV
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
              className={`cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Subiendo...' : 'Seleccionar CSV'}
            </label>
            <p className="mt-2 text-sm text-gray-600">
              Formatos aceptados: .csv con headers: agent_id, agent_name, team, date, calls_handled, avg_handle_time, satisfaction_score, resolution_rate
            </p>
          </div>

          {/* Barra de progreso */}
          {uploading && progress.total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Procesando...</span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Resultados de la carga */}
        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✓ Carga Exitosa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.totalProcessed}
                </div>
                <div className="text-sm text-gray-600">Registros Procesados</div>
              </div>
              <div className="bg-white rounded p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results.agentsUpdated}
                </div>
                <div className="text-sm text-gray-600">Agentes Actualizados</div>
              </div>
              <div className="bg-white rounded p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {results.metricsAdded}
                </div>
                <div className="text-sm text-gray-600">Métricas Agregadas</div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📋 Formato esperado del CSV
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            El archivo debe incluir las siguientes columnas (en cualquier orden):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800">Tabla agents:</h4>
              <ul className="list-disc list-inside text-sm text-blue-700">
                <li>agent_id (obligatorio)</li>
                <li>agent_name (obligatorio)</li>
                <li>team (opcional)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Tabla performance_metrics:</h4>
              <ul className="list-disc list-inside text-sm text-blue-700">
                <li>date (obligatorio, formato YYYY-MM-DD)</li>
                <li>calls_handled (obligatorio)</li>
                <li>avg_handle_time (obligatorio)</li>
                <li>satisfaction_score (obligatorio, 1-5)</li>
                <li>resolution_rate (obligatorio, 0-100)</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-4">
            El sistema acepta variaciones en los nombres de columnas (case insensitive).
            Después de la carga, se recalcularán automáticamente los tiers de los agentes.
          </p>
        </div>
      </div>
    </div>
  );
}
