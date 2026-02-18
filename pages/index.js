import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [agents, setAgents] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      let { data } = await supabase.from('performance_metrics').select('*, agents(full_name)')
      setAgents(data || [])
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Call Center Performance - Agents Overview</h1>
        <div className="text-sm font-medium text-slate-500">Team Lead: Alcantar Janeth</div>
      </header>

      {/* Resumen de Tiers */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <h3 className="text-slate-500 text-sm font-bold uppercase">Tier A - Elite</h3>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
          <h3 className="text-slate-500 text-sm font-bold uppercase">Tier B - Convertible</h3>
          <p className="text-3xl font-bold text-slate-800">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <h3 className="text-slate-500 text-sm font-bold uppercase">Tier C - Risk</h3>
          <p className="text-3xl font-bold text-slate-800">{agents.length}</p>
        </div>
      </div>

      {/* Tabla de Agentes */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-bold text-slate-600">Agente</th>
              <th className="p-4 font-bold text-slate-600 text-center">Tier</th>
              <th className="p-4 font-bold text-slate-600 text-right">Value Capture</th>
              <th className="p-4 font-bold text-slate-600 text-right">Closing Rate</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((m) => (
              <tr key={m.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-800">{m.agents?.full_name}</td>
                <td className="p-4 text-center">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Tier {m.tier}</span>
                </td>
                <td className="p-4 text-right font-mono font-bold">{m.value_capture_rate}%</td>
                <td className="p-4 text-right text-slate-600">{m.closing_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
