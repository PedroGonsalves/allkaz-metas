import React, { useState } from 'react';
import { AppData, Team, Sale } from '../types';
import { TeamIcon } from './Icons';
import { Settings, Plus, Trash2, Edit2, X, Check, Save, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type EditorProps = {
  data: AppData;
  onSave: (data: AppData) => void;
  onClose: () => void;
};

export default function Editor({ data: initialData, onSave, onClose }: EditorProps) {
  const [data, setData] = useState<AppData>(initialData);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  const exportCSV = () => {
    const headers = ['Mês/Ano', 'Equipe', 'Membro', 'Produto', 'Valor (R$)'];
    const rows: string[] = [];
    
    data.teams.forEach(team => {
      team.sales.forEach(sale => {
        rows.push(`"${data.monthYear}","${team.name}","${team.members}","${sale.product}","${sale.price}"`);
      });
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_vendas_${data.monthYear.replace(/[\s/]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateGlobal = (field: keyof AppData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateTeam = (teamId: string, field: keyof Team, value: string | number) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, [field]: value } : t)
    }));
  };

  const addSale = (teamId: string) => {
    const newSale: Sale = { id: `sale_${Date.now()}`, product: 'Novo Produto', price: 0 };
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(t => 
        t.id === teamId ? { ...t, sales: [...t.sales, newSale] } : t
      )
    }));
  };

  const updateSale = (teamId: string, saleId: string, field: keyof Sale, value: string | number) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(t => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          sales: t.sales.map(s => s.id === saleId ? { ...s, [field]: value } : s)
        };
      })
    }));
  };

  const removeSale = (teamId: string, saleId: string) => {
    setData(prev => ({
      ...prev,
      teams: prev.teams.map(t => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          sales: t.sales.filter(s => s.id !== saleId)
        };
      })
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Settings className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Editor de Metas</h1>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={exportCSV}
            className="px-6 py-2 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <Download size={18} /> Exportar CSV
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium flex items-center gap-2"
          >
            <X size={18} /> Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <Check size={18} /> Salvar & Apresentar
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-8 overflow-y-auto pb-24">
        
        {/* Configurações Globais */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            Configurações Globais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Mês/Ano</label>
              <input 
                type="text" 
                value={data.monthYear}
                onChange={e => updateGlobal('monthYear', e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Meta de Quantidade</label>
              <input 
                type="number" 
                value={data.targetSalesCount}
                onChange={e => updateGlobal('targetSalesCount', Number(e.target.value))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Meta de Arrecadação (R$)</label>
              <input 
                type="number" 
                value={data.targetRevenue}
                onChange={e => updateGlobal('targetRevenue', Number(e.target.value))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Equipes */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 pl-2">Equipes & Vendas</h2>
          {data.teams.map(team => (
            <div key={team.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                    <TeamIcon name={team.iconName} className="w-6 h-6" />
                  </div>
                  <div>
                    {editingTeamId === team.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                           <input 
                            type="text" 
                            value={team.name}
                            onChange={e => updateTeam(team.id, 'name', e.target.value)}
                            className="font-bold text-lg p-1 border rounded"
                          />
                           <input 
                            type="text" 
                            value={team.members}
                            onChange={e => updateTeam(team.id, 'members', e.target.value)}
                            className="text-gray-500 p-1 border rounded"
                          />
                          <button onClick={() => setEditingTeamId(null)} className="p-2 text-green-600 bg-green-100 rounded hover:bg-green-200">
                            <Save size={16} />
                          </button>
                        </div>
                        <div className="flex gap-2 text-sm">
                           <input 
                            type="number" 
                            placeholder="Meta de Vendas"
                            value={team.targetSalesCount}
                            onChange={e => updateTeam(team.id, 'targetSalesCount', Number(e.target.value))}
                            className="p-1 border rounded w-32"
                          />
                           <input 
                            type="number" 
                            placeholder="Meta de R$"
                            value={team.targetRevenue}
                            onChange={e => updateTeam(team.id, 'targetRevenue', Number(e.target.value))}
                            className="p-1 border rounded w-32"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          {team.name}
                          <button onClick={() => setEditingTeamId(team.id)} className="text-gray-400 hover:text-blue-600">
                            <Edit2 size={14} />
                          </button>
                        </h3>
                        <p className="text-gray-500 text-sm">{team.members}</p>
                      </>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => addSale(team.id)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} /> Nova Venda
                </button>
              </div>
              
              <div className="p-6">
                {team.sales.length > 0 ? (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {team.sales.map(sale => (
                        <motion.div 
                          key={sale.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-100"
                        >
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={sale.product}
                              placeholder="Nome do produto"
                              onChange={e => updateSale(team.id, sale.id, 'product', e.target.value)}
                              className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="w-48 relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
                            <input 
                              type="number" 
                              value={sale.price || ''}
                              placeholder="Valor"
                              onChange={e => updateSale(team.id, sale.id, 'price', Number(e.target.value))}
                              className="w-full pl-10 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800"
                            />
                          </div>
                          <button 
                            onClick={() => removeSale(team.id, sale.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    Nenhuma venda registrada para esta equipe.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
