# Backend Integration TODO

- [x] Install mysql2 dependency
- [x] Create lib/db.ts for database connection and query helper
- [x] Create app/api/uma/route.ts for listing and creating Uma
- [ ] Create app/api/uma/[id]/route.ts for single Uma operations
- [x] Create app/api/training/route.ts for training sessions
- [x] Create app/api/races/route.ts for race results and history
- [x] Configure .env.local with DB environment variables
- [x] Update app/characters/page.tsx to use /api/uma
- [ ] Update app/training/page.tsx to use /api/training
- [x] Update app/racing/page.tsx to use /api/races
- [x] Update app/history/page.tsx to use /api/races for race history
- [ ] Test end-to-end loop: create Uma, train, race, check history
