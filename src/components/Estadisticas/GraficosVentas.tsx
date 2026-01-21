"use client";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LabelList
} from 'recharts';
import { TrendingUp, PieChart } from 'lucide-react';

interface GraficosProps {
  dataTendencia: Array<{ name: string; total: number }>;
  dataMetodos: Array<{ name: string; total: number }>;
  periodo: string;
}

export default function GraficosVentas({ dataTendencia, dataMetodos, periodo }: GraficosProps) {
  
  const esDiaUnico = periodo === 'hoy' || periodo === 'ayer' || periodo === 'fecha-especifica';
  const labelEjeX = esDiaUnico ? 'Por Hora' : (periodo === 'semana' ? 'Semana Completa' : 'Por Día');

  const formatMoney = (value: number) => `$${value.toFixed(2)}`;
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. TENDENCIA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600"/>
            Tendencia de Ingresos
          </h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
            {labelEjeX}
          </span>
        </div>

        <div className="h-[350px] w-full">
          {dataTendencia.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataTendencia} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6b7280' }} // Letra un poco más pequeña
                  dy={10}
                  // CAMBIO: "preserveStartEnd" evita que se monten si no caben
                  interval={esDiaUnico ? "preserveStartEnd" : 0} 
                  padding={{ left: 10, right: 10 }}
                />
                
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  tickFormatter={(val) => `$${val}`}
                />
                
                <Tooltip 
                  formatter={(value: any) => [formatMoney(Number(value)), 'Ventas']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVentas)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
              No hay datos suficientes para graficar
            </div>
          )}
        </div>
      </div>

      {/* 2. MÉTODOS */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <PieChart size={20} className="text-emerald-600"/>
            Distribución por Método
          </h3>
        </div>

        <div className="h-[350px] w-full">
          {dataMetodos.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dataMetodos} 
                layout="vertical" 
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }} 
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={110}
                  tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  formatter={(value: any) => [formatMoney(Number(value)), 'Total']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={32}>
                  <LabelList 
                    dataKey="total" 
                    position="right" 
                    formatter={(val: any) => `$${Number(val).toFixed(2)}`}
                    style={{ fontSize: '11px', fontWeight: 'bold', fill: '#6b7280' }}
                  />
                  {dataMetodos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
              No hay datos de pagos
            </div>
          )}
        </div>
      </div>

    </div>
  );
}