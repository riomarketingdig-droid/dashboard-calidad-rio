import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function UploadPage() {
  const [status, setStatus] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setStatus('Procesando archivo...')
    const reader = new FileReader()

    reader.onload = async (e) => {
      const text = e.target.result
      // Simulamos el procesamiento del CSV para esta fase
      setStatus('Subiendo datos a Supabase...')
      
      // Aquí conectaremos la lógica de inserción masiva en la siguiente iteración
      // Por ahora, disparamos el motor de Tiers que programamos en Supabase
      const { error } = await supabase.rpc('calculate_agent_tiers')
      
      if (error) {
        setStatus('Error al procesar: ' + error.message)
      } else {
        setStatus('¡Datos actualizados con éxito! Revisa el Dashboard.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
        <img src="/logo.png" alt="Logo" className="h-16 mx-auto mb-6" />
        <h1 className="text-2xl font-black text-slate-800 mb-2">IMPORTADOR DE DATOS</h1>
        <p className="text-slate-500 text-sm mb-8">Sube tus archivos de Agendamiento o Coordinación para actualizar los Tiers.</p>
        
        <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-10 hover:border-blue-500 cursor-pointer transition-colors bg-slate-50">
          <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv" />
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Seleccionar Archivo CSV</span>
        </label>
        
        {status && (
          <div className="mt-6 p-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase">
            {status}
          </div>
        )}
        
        <a href="/" className="inline-block mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600">
          ← Volver al Dashboard
        </a>
      </div>
    </div>
  )
}
