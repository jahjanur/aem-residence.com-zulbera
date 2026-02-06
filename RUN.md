# Run instructions

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- **Web:** http://localhost:5173/
- **API:** http://localhost:4000

After running, the UI should load with no Tailwind errors. Product forms use only name, category, unit, price, status (no stock/reorder). Create Order and Reconciliation use product unit and price for loss calculation.
