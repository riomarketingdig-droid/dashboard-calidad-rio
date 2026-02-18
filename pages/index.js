import { useState } from 'react';
import { useRouter } from 'next/router';
import TabNavigation from '../components/layout/TabNavigation';
import PeriodSelector from '../components/layout/PeriodSelector';
import MetricCards from '../components/gerencial/MetricCards';
import CoordinacionTable from '../components/gerencial/CoordinacionTable';
import AgendamientoTable from '../components/gerencial/AgendamientoTable';
import CoordinacionDetalle from '../components/operativo/CoordinacionDetalle';
import AgendamientoDetalle from '../components/operativo/AgendamientoDetalle';
import FloatingUploadButton from '../components/upload/FloatingUploadButton';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('gerencial');
  const router = useRouter();

  const renderContent = () => {
    switch(activeTab) {
      case 'gerencial':
        return (
          <>
            <MetricCards />
            <CoordinacionTable />
            <AgendamientoTable />
          </>
        );
      case 'coordinacion':
        return <CoordinacionDetalle />;
      case 'agendamiento':
        return <AgendamientoDetalle />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div className="flex items-center gap-4">
          <img src="/Logotipo RIO a color.png" alt="Logo RIO" className="h-14 w-auto object-contain" />
          <div className="border-l pl-4 border-slate-200">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
              Tablero de Control
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-1 tracking-widest uppercase">
              Visión Gerencial
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <div className="text-right">
            <p className="text-sm font-black text-slate-800 leading-none">Alcantar Janeth</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Coordinadora</p>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
            AJ
          </div>
        </div>
      </header>

      {/* PERIOD SELECTOR */}
      <PeriodSelector />

      {/* TAB NAVIGATION */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* CONTENT */}
      {renderContent()}

      {/* FLOATING UPLOAD BUTTON */}
      <FloatingUploadButton />

      {/* FOOTER */}
      <footer className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[3px]">
        Análisis Integral de Desempeño
      </footer>
    </div>
  );
}
