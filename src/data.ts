import { AppData } from './types';

export const defaultData: AppData = {
  monthYear: 'Setembro / 2026',
  targetSalesCount: 50,
  targetRevenue: 500000,
  teams: [
    {
      id: 'team_1',
      name: 'Onça Pintada',
      members: 'Guilherme',
      iconName: 'paw',
      targetSalesCount: 20,
      targetRevenue: 200000,
      sales: [
        { id: 's1', product: 'Retroescavadeira', price: 150000 },
        { id: 's2', product: 'Trator M', price: 85000 },
      ],
    },
    {
      id: 'team_2',
      name: 'Harpia',
      members: 'Humberto',
      iconName: 'bird',
      targetSalesCount: 15,
      targetRevenue: 150000,
      sales: [
        { id: 's3', product: 'Empilhadeira', price: 60000 },
        { id: 's4', product: 'Compressor Industrial', price: 25000 },
        { id: 's5', product: 'Gerador 500kVA', price: 45000 },
      ],
    },
    {
      id: 'team_3',
      name: 'Lobo Guará',
      members: 'Andrey',
      iconName: 'dog',
      targetSalesCount: 15,
      targetRevenue: 150000,
      sales: [
        { id: 's6', product: 'Rolo Compactador', price: 120000 },
      ],
    },
  ],
};

const STORAGE_KEY = 'allkaz_metas_data';

export function loadData(): AppData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.teams) {
        parsed.teams = parsed.teams.map((team: any) => ({
          ...team,
          targetSalesCount: team.targetSalesCount || 10,
          targetRevenue: team.targetRevenue || 100000,
        }));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load data', e);
  }
  return defaultData;
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
