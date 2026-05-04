# Plan: Student Progress Data Export API

## Phase 1: Convex Export Queries — COMPLETE

- [x] Write tests for getStudentExport query
- [x] Write tests for getClassExport query
- [x] Write tests for getSubmissionExport query
- [x] Implement getStudentExport with indexed queries
- [x] Implement getClassExport using Promise.all to batch per-student queries
- [x] Implement getSubmissionExport with cursor pagination support

## Phase 2: CSV Formatting — COMPLETE [checkpoint: 918bb58]

- [x] Write tests for CSV formatting utility
- [x] Implement toCsv helper in lib/teacher/data-export.ts
- [x] Add formatStudentExport and formatClassExport formatters

## Phase 3: Teacher UI [ ]

- [ ] Write test: Export button visible on teacher class overview page
- [ ] Add export dropdown to teacher class overview
- [ ] Wire export buttons to Convex query calls with date range picker
- [ ] Add download trigger (Blob + URL.createObjectURL)
- [ ] Add export to individual student detail page

## Phase 4: Verification & Handoff [ ]

- [ ] Verify exported CSV opens correctly in Excel/Google Sheets
- [ ] Verify exported JSON is valid and matches UI data
- [ ] Test date range filtering returns correct subset
- [ ] Run full test suite
- [ ] Document export API in teacher docs
- [ ] Handoff
