# Ionixx Order Splitter API

implementation for the Ionixx.

## Run

```bash
npm install
npm run build
npm test
npm start
```

Development mode:

```bash
npm run dev
```

The API starts on `http://localhost:3000` by default.
Set `CORS_ORIGIN` to restrict browser access to a specific origin; it defaults to `*`.

## API

### Health

`GET /health`

### Create/split order

`POST /api/v1/orders`

Example:

```json
{
  "type": "BUY",
  "amount": "1000.00",
  "portfolio": [
    { "symbol": "AAPL", "weight": "33.333333" },
    { "symbol": "TSLA", "weight": "33.333333" },
    { "symbol": "MSFT", "weight": "33.333334" }
  ]
}
```

The fixed stock price is `$100`. A portfolio item may provide `marketPrice`, which takes priority over the fixed price:

```json
{ "symbol": "AAPL", "weight": "60", "marketPrice": "200" }
```

### Historic orders

`GET /api/v1/orders`

`GET /api/v1/orders/:id`

All history is lost when the process restarts by design.

## Money and rounding

Money is represented internally as integer cents using `bigint`; no binary floating-point arithmetic is used for allocation. Portfolio weights are represented as integer millionths of a percent and must total **exactly 100%**.

For an amount such as `$1000` and weights `33.333333% + 33.333333% + 33.333334%`, the money allocation is `$333.33 + $333.33 + $333.34 = $1000.00`.

The final portfolio line receives the remainder after the earlier lines are rounded, guaranteeing that the allocated money equals the requested amount.

Share quantity precision is configurable through `QUANTITY_DECIMALS` and defaults to 3, matching the challenge's example of supporting up to 3 decimal places today.

## Execution date

The challenge specifies that markets are open Monday through Friday but does not specify a market timezone or trading hours. The implementation therefore returns the next weekday as `executionDate`, without pretending to model exchange hours.

## Error handling

Malformed JSON, invalid amounts, invalid weights, duplicate symbols, unsupported order types, invalid IDs, and invalid market prices return clean JSON `400` responses. Unknown resources return `404`; unexpected errors return a generic `500` message instead of exposing stack traces.

## Performance

Every HTTP response logs method, path, status, and elapsed time in milliseconds, as requested by the challenge.

## Project structure

```text
src/
  controllers/       HTTP controllers
  errors/            Application error type
  middleware/        Error handling and timing
  models/            Domain types
  routes/            REST routes
  services/          Business logic
  store/             In-memory history
  utils/             Decimal, money and ID helpers
  validators/        Request parsing
  app.ts             Express application
  config.ts          Runtime configuration
  server.ts          HTTP entry point
tests/               Node test runner tests
```

## Dependencies

- `express`: HTTP server and REST routing.
- `helmet`: secure HTTP response headers.
- `cors`: configurable cross-origin request handling.
- TypeScript tooling: `typescript`, `tsx`, `@types/node`, `@types/express`.

No ORM, database, or decimal library is included. The decimal/money handling is deliberately small and explicit for this challenge.

## Quality checks

Before submission:

```bash
npm ci
npm run build
npm test
npm audit --audit-level=high
```

.
