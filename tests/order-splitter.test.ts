import test from 'node:test';
import assert from 'node:assert/strict';
import { splitOrder } from '../src/services/order-splitter.service';

const portfolio = [
  { symbol: 'AAPL', weight: '33.333333' },
  { symbol: 'TSLA', weight: '33.333333' },
  { symbol: 'MSFT', weight: '33.333334' }
];

test('allocates money without floating point mismatch', () => {
  const order = splitOrder({ type: 'BUY', amount: '1000', portfolio });
  const total = order.orders.reduce((sum, item) => sum + Number(item.amount), 0);
  assert.equal(total.toFixed(2), '1000.00');
  assert.equal(order.orders[0].amount, '333.33');
  assert.equal(order.orders[1].amount, '333.33');
  assert.equal(order.orders[2].amount, '333.34');
});

test('supports market price override', () => {
  const order = splitOrder({
    type: 'BUY', amount: '100',
    portfolio: [
      { symbol: 'AAPL', weight: '60', marketPrice: '200' },
      { symbol: 'TSLA', weight: '40' }
    ]
  });
  assert.equal(order.orders[0].price, '200');
  assert.equal(order.orders[0].quantity, '0.3');
  assert.equal(order.orders[1].quantity, '0.4');
});

test('rejects weights that do not total exactly 100', () => {
  assert.throws(() => splitOrder({ type: 'BUY', amount: '100', portfolio: [
    { symbol: 'AAPL', weight: '50' }, { symbol: 'TSLA', weight: '49.99' }
  ]}), /must sum exactly to 100/);
});

test('rejects invalid order type', () => {
  assert.throws(() => splitOrder({ type: 'HOLD' as never, amount: '100', portfolio }), /type must be BUY or SELL/);
});

test('rejects bad amount', () => {
  assert.throws(() => splitOrder({ type: 'BUY', amount: '10.999', portfolio }), /at most 2 decimal places/);
});
