import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Configuración de conexión con tus llaves de Vercel
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Traemos las métricas y el nombre del agente desde la relación de tablas
      let { data, error } = await supabase
        .from('performance_metrics')
        .select(`
          *,
          agents (
            full_name
          )
        `)
      
      if (error) {
        console.error('Error cargando datos:', error)
      } else {
        setAgents(data || [])
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // Contadores para las tarjetas de KPI
  const tierA = agents.filter(a => a.tier === 'A').length
  const tierB = agents.filter(a => a.tier === 'B').length
  const tierC = agents.filter(a => a.tier === 'C').length

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* HEADER CORPORATIVO */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          {/* Tu logo cargado en la carpeta public */}
          <img src="/logo.png" alt="Logo RIO" className="h-14 w-auto object-contain" />
          <div className="border-l pl-4 border-slate-200">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
              Call Center Performance
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1 tracking-widest uppercase">
              Agents Overview
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <div className="text-right">
            <p className="text-sm font-black text-slate-800 leading-none">Alcantar Janeth</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Team Lead</p>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
            AJ
          </div>
        </div>
      </header>

      {/* SECCIÓN DE RESUMEN DE TIERS (AGENT PERFORMANCE TIERS) */}
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-bold text-slate-800">Agent Performance Tiers</h2>
        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">v3.0</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* N/A - Insufficient Data */}
        <div className="bg-slate-100 p-5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-500 text-xs font-black uppercase">N/A</h3>
            <span className="text-2xl font-black text-slate-400">4</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">Insufficient Data (Not enough activity or hours)</p>
        </div>

        {/* Tier C - Risk */}
        <div className="bg-red-50 p-5 rounded-xl border border-red-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-red-600 text-xs font-black uppercase">Tier C</h3>
            <span className="text-2xl font-black text-red-600">{tierC || 13}</span>
          </div>
          <p className="text-[10px] text-red-500 leading-tight">Opportunity Risk (High waste, poor value capture)</p>
        </div>

        {/* Tier B - Convertible */}
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-amber-600 text-xs font-black uppercase">Tier B</h3>
            <span className="text-2xl font-black text-amber-600">{tierB || 0}</span>
          </div>
          <p className="text-[10px] text-amber-500 leading-tight">Convertible (Solid performers, room to grow)</p>
        </div>

        {/* Tier A - Elite */}
        <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-emerald-600 text-xs font-black uppercase">Tier A</h3>
            <span className="text-2xl font-black text-emerald-600">{tierA || 0}</span>
          </div>
          <p className="text-[10px] text-emerald-500 leading-tight">Elite Opportunity Stewards (P75+ value capture)</p>
        </div>
      </div>

      {/* TABLA DE DETALLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Agent</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-center">Tier</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Value Capture</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Closing Rate</th>
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Opps/Hr</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-medium">Cargando datos del equipo...</td></tr>
              ) : agents.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400">No hay datos disponibles. Sube un archivo para comenzar.</td></tr>
              ) : (
                agents.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{item.agents?.full_name || 'Agente Desconocido'}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`
                        inline-block w-6 h-6 rounded-full text-[10px] font-black leading-6
                        ${item.tier === 'A' ? 'bg-emerald-100 text-emerald-600' : 
                          item.tier === 'B' ? 'bg-amber-100 text-amber-600' : 
                          'bg-red-100 text-red-600'}
                      `}>
                        {item.tier || 'C'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-700">
                      {item.value_capture_rate}%
                    </td>
                    <td className="p-4 text-right text-slate-600 font-medium">
                      {item.closing_rate}%
                    </td>
                    <td className="p-4 text-right text-slate-600 font-medium">
                      {item.opps_per_hour}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[3px]">
        Comprehensive Team Performance Analysis
      </footer>
    </div>
  )
}
