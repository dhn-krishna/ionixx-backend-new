import { HistoricOrder } from '../models/order';

const orders: HistoricOrder[] = [];

export const orderStore = {
  add(order: HistoricOrder): HistoricOrder {
    orders.push(order);
    return order;
  },
  all(): HistoricOrder[] {
    return [...orders].reverse();
  }
};
