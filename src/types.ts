export type Sale = {
  id: string;
  product: string;
  price: number;
};

export type Team = {
  id: string;
  name: string;
  members: string;
  iconName: string;
  targetSalesCount: number;
  targetRevenue: number;
  sales: Sale[];
};

export type AppData = {
  monthYear: string;
  targetSalesCount: number;
  targetRevenue: number;
  teams: Team[];
};
