import React, { useState, useEffect } from 'react';
import { AppData, Team } from '../types';
import { TeamIcon } from './Icons';
import { formatCurrency } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type PresentationProps = {
  data: AppData;
  onExit: () => void;
};

type Phase = 
  | { type: 'TEAM'; index: number }
  | { type: 'OVERALL' }
  | { type: 'RANKING' };

export default function Presentation({ data, onExit }: PresentationProps) {
  const [phase, setPhase] = useState<Phase>({ type: 'TEAM', index: 0 });
  const [scale, setScale] = useState(1);
  const SLIDE_DURATION = 8000;

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prevPhase) => {
        if (prevPhase.type === 'TEAM') {
          if (prevPhase.index < data.teams.length - 1) {
            return { type: 'TEAM', index: prevPhase.index + 1 };
          } else {
            return { type: 'OVERALL' };
          }
        } else if (prevPhase.type === 'OVERALL') {
          return { type: 'RANKING' };
        } else {
          return data.teams.length > 0 ? { type: 'TEAM', index: 0 } : { type: 'OVERALL' };
        }
      });
    }, SLIDE_DURATION);
    
    return () => clearInterval(timer);
  }, [data.teams.length]);

  return (
    <div className="w-screen h-screen bg-blue-900 flex items-center justify-center overflow-hidden font-sans">
      <div 
        className="w-[1920px] h-[1080px] bg-blue-900 text-white relative flex flex-col origin-center shrink-0"
        style={{ transform: `scale(${scale})` }}
      >
        <button 
          onClick={onExit}
          className="absolute top-10 right-10 z-50 text-white/50 hover:text-white transition-colors text-xl uppercase tracking-widest bg-black/20 px-8 py-4 rounded-full backdrop-blur-sm cursor-pointer"
        >
          Editar
        </button>

        <div className="absolute top-10 left-12 z-40 opacity-50">
          <h1 className="text-3xl font-bold tracking-widest uppercase text-yellow-400">Allkaz Equipamentos</h1>
          <p className="text-xl tracking-widest mt-2">{data.monthYear}</p>
        </div>

        <div className="flex-1 w-full h-full flex items-center justify-center p-16">
          <AnimatePresence mode="wait">
            {phase.type === 'TEAM' && data.teams.length > 0 && (
              <TeamSlide key={`team-${phase.index}`} team={data.teams[phase.index]} />
            )}
            {phase.type === 'OVERALL' && (
               <OverallSlide key="overall" data={data} />
            )}
            {phase.type === 'RANKING' && (
               <RankingSlide key="ranking" data={data} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TeamSlide({ team }: { team: Team, key?: React.Key }) {
  const totalSales = team.sales.length;
  const totalRevenue = team.sales.reduce((sum, s) => sum + s.price, 0);
  
  const recentSales = [...team.sales].reverse().slice(0, 3);
  
  const targetSalesCount = team.targetSalesCount || 10;
  const targetRevenue = team.targetRevenue || 100000;
  
  const salesProgress = Math.min(100, (totalSales / targetSalesCount) * 100);
  const revenueProgress = Math.min(100, (totalRevenue / targetRevenue) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1400px] flex flex-col items-center justify-center h-full gap-12"
    >
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-yellow-400 mb-6 bg-yellow-400/10 p-8 rounded-full shadow-[0_0_40px_rgba(250,204,21,0.2)]"
        >
          <TeamIcon name={team.iconName} className="w-32 h-32" />
        </motion.div>
        <h2 className="text-7xl font-black mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
          Equipe {team.name}
        </h2>
        <p className="text-3xl text-blue-300 font-light tracking-wide">{team.members}</p>
      </div>

      <div className="flex gap-10 w-full shrink-0">
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-[2rem] p-12 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${salesProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              className="h-full bg-blue-400"
            />
          </div>
          <p className="text-blue-300 uppercase tracking-widest text-xl mb-4">Vendas Realizadas</p>
          <p className="text-7xl font-bold text-white mb-2">{totalSales}</p>
          <p className="text-blue-200 text-xl">Meta: {targetSalesCount}</p>
        </div>
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-[2rem] p-12 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${revenueProgress}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-yellow-400"
            />
          </div>
          <p className="text-blue-300 uppercase tracking-widest text-xl mb-4">Total Arrecadado</p>
          <p className="text-7xl font-bold text-yellow-400 mb-2">{formatCurrency(totalRevenue)}</p>
          <p className="text-yellow-200/50 text-xl">Meta: {formatCurrency(targetRevenue)}</p>
        </div>
      </div>

      <div className="w-full max-w-[1200px] shrink-0">
        <h3 className="text-blue-200 uppercase tracking-widest text-2xl mb-6 border-b border-white/10 pb-4">
          Últimas Vendas
        </h3>
        <div className="space-y-4">
          <AnimatePresence>
            {recentSales.length > 0 ? recentSales.map((sale, i) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex justify-between items-center bg-white/5 rounded-2xl p-6 border border-white/5"
              >
                <span className="text-3xl font-medium">{sale.product}</span>
                <span className="text-3xl font-bold text-green-400">{formatCurrency(sale.price)}</span>
              </motion.div>
            )) : (
               <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/40 py-8 text-2xl"
              >
                Nenhuma venda registrada ainda.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function OverallSlide({ data }: { data: AppData, key?: React.Key }) {
  const totalSalesCount = data.teams.reduce((sum, team) => sum + team.sales.length, 0);
  const totalRevenue = data.teams.reduce(
    (sum, team) => sum + team.sales.reduce((s, sale) => s + sale.price, 0),
    0
  );

  const salesRemaining = Math.max(0, data.targetSalesCount - totalSalesCount);
  const revenueRemaining = Math.max(0, data.targetRevenue - totalRevenue);

  const salesProgress = Math.min(100, (totalSalesCount / (data.targetSalesCount || 1)) * 100);
  const revenueProgress = Math.min(100, (totalRevenue / (data.targetRevenue || 1)) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1500px] flex flex-col items-center justify-center h-full gap-16"
    >
       <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="shrink-0"
        >
          <Trophy className="w-40 h-40 text-yellow-400" />
        </motion.div>

        <h2 className="text-7xl lg:text-8xl font-black text-center text-white shrink-0">
          Meta Global - {data.monthYear}
        </h2>

        <div className="grid grid-cols-2 gap-12 w-full shrink-0">
          {/* Sales Count Card */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-[2rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${salesProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                className="h-full bg-blue-400"
              />
            </div>
            
            <h3 className="text-blue-300 uppercase tracking-widest text-2xl mb-8">Quantidade de Vendas</h3>
            
            <div className="flex flex-row justify-between items-end gap-6">
              <div>
                <p className="text-8xl font-bold text-white">{totalSalesCount}</p>
                <p className="text-blue-200 text-2xl mt-4">de {data.targetSalesCount} metas</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-blue-400">
                  {salesRemaining > 0 ? `Faltam ${salesRemaining}` : 'Meta Batida! 🎉'}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-[2rem] p-12 border border-yellow-500/30 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${revenueProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                className="h-full bg-yellow-400"
              />
            </div>
            
            <h3 className="text-yellow-200 uppercase tracking-widest text-2xl mb-8">Arrecadação Total</h3>
            
            <div className="flex flex-row justify-between items-end gap-6">
              <div>
                <p className="text-7xl font-bold text-yellow-400">{formatCurrency(totalRevenue)}</p>
                <p className="text-yellow-200 text-2xl mt-4">de {formatCurrency(data.targetRevenue)} metas</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-300">
                  {revenueRemaining > 0 ? `Faltam ${formatCurrency(revenueRemaining)}` : 'Meta Batida! 🎉'}
                </p>
              </div>
            </div>
          </div>
        </div>
    </motion.div>
  );
}

function Trophy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 6 6 8 6 8s6-2 6-8V2Z" />
    </svg>
  );
}

function RankingSlide({ data }: { data: AppData, key?: React.Key }) {
  const rankedByRevenue = [...data.teams].sort((a, b) => {
    const revA = a.sales.reduce((s, sale) => s + sale.price, 0);
    const revB = b.sales.reduce((s, sale) => s + sale.price, 0);
    return revB - revA;
  });

  const rankedBySales = [...data.teams].sort((a, b) => b.sales.length - a.sales.length);

  const chartData = data.teams.map(team => {
    const salesCount = team.sales.length;
    const target = team.targetSalesCount || 10;
    const percent = Math.min(100, (salesCount / target) * 100);
    return {
      name: team.name,
      percent: percent,
      sales: salesCount,
      target: target
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[1600px] flex flex-col items-center justify-center h-full gap-10"
    >
      <h2 className="text-6xl font-black text-center text-white flex items-center justify-center gap-6 shrink-0">
        🏆 Ranking e Desempenho
      </h2>

      <div className="grid grid-cols-2 gap-10 w-full shrink-0">
        {/* Ranking de Arrecadação */}
        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-10 border border-white/10 flex flex-col h-[400px]">
          <h3 className="text-yellow-400 uppercase tracking-widest text-xl mb-6 pb-4 border-b border-white/10 shrink-0">
            Top Arrecadação
          </h3>
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {rankedByRevenue.map((team, index) => {
               const revenue = team.sales.reduce((s, sale) => s + sale.price, 0);
               return (
                 <div key={team.id} className="flex items-center gap-6">
                    <span className="text-4xl font-black text-white/20 w-12">{index + 1}º</span>
                    <div className="w-16 h-16 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center">
                       <TeamIcon name={team.iconName} className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold">{team.name}</p>
                    </div>
                    <p className="text-4xl font-bold text-yellow-400">{formatCurrency(revenue)}</p>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Ranking de Vendas */}
        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-10 border border-white/10 flex flex-col h-[400px]">
          <h3 className="text-blue-400 uppercase tracking-widest text-xl mb-6 pb-4 border-b border-white/10 shrink-0">
            Top Volume de Vendas
          </h3>
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {rankedBySales.map((team, index) => (
              <div key={team.id} className="flex items-center gap-6">
                 <span className="text-4xl font-black text-white/20 w-12">{index + 1}º</span>
                 <div className="w-16 h-16 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center">
                    <TeamIcon name={team.iconName} className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                   <p className="text-3xl font-bold">{team.name}</p>
                 </div>
                 <p className="text-4xl font-bold text-white">{team.sales.length} <span className="text-2xl font-normal text-white/50">vendas</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts - Progresso */}
      <div className="w-full h-[350px] bg-white/5 backdrop-blur-md rounded-[2rem] p-10 border border-white/10 flex flex-col shrink-0">
        <h3 className="text-white/70 uppercase tracking-widest text-xl mb-6 shrink-0">
          Progresso da Meta (Vendas)
        </h3>
        <div className="flex-1 w-full relative">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 60, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 24 }} width={180} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '24px', padding: '16px 24px' }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Progresso']}
                />
                <Bar dataKey="percent" radius={[0, 16, 16, 0]} background={{ fill: 'rgba(255,255,255,0.05)', radius: [0, 16, 16, 0] }} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percent >= 100 ? '#4ade80' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

