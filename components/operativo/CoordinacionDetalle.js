import SemaforoIndicator from './SemaforoIndicator';

export default function CoordinacionDetalle() {
  // Datos de ejemplo basados en el archivo The one thing Coordinación.xlsx
  const colaboradores = [
    { nombre: 'Ceballos Beltrán Juan Manuel', unidad: 'Central', efectividad: 98.5, tiempo: 6.8, registros: 145, noConformidades: 0, sncLab: 0, hallazgos: 0.5 },
    { nombre: 'Lopez Fajardo Maria Caridad', unidad: 'Norte', efectividad: 95.2, tiempo: 8.2, registros: 132, noConformidades: 2, sncLab: 1, hallazgos: 2.1 },
    { nombre: 'Pineda Guzman Hilda Consuelo', unidad: 'Sur', efectividad: 94.8, tiempo: 8.5, registros: 128, noConformidades: 3, sncLab: 2, hallazgos: 2.8 },
    { nombre: 'Buruel Ortiz Luis Omar', unidad: 'Central', efectividad: 97.1, tiempo: 7.2, registros: 118, noConformidades: 1, sncLab: 0, hallazgos: 0.8 },
    { nombre: 'Lopez Perez Atziri Lorena', unidad: 'Norte', efectividad: 96.3, tiempo: 7.5, registros: 108, noConformidades: 1, sncLab: 1, hallazgos: 1.2 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">COORDINACIÓN - Detalle por Colaborador</h3>
        <p className="text-xs text-slate-400 mt-1">Ritual diario obligatorio (10 minutos) - Revisar quién estuvo debajo de meta y acción correctiva inmediata
