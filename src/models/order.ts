export type OrderType = 'BUY' | 'SELL';

export interface PortfolioItem {
  symbol: string;
  weight: string;
  marketPrice?: string;
}

export interface SplitOrderRequest {
  type: OrderType;
  amount: string;
  portfolio: PortfolioItem[];
}

export interface OrderLine {
  symbol: string;
  weight: string;
  price: string;
  amount: string;
  quantity: string;
}

export interface HistoricOrder extends SplitOrderRequest {
  id: string;
  createdAt: string;
  executionDate: string;
  orders: OrderLine[];
}
