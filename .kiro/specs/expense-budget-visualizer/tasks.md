# Implementation Plan: Expense & Budget Visualizer

## Overview

This plan implements the Expense & Budget Visualizer as a fully client-side web application constrained to exactly three source files (`index.html`, `css/style.css`, `js/main.js`) plus a Vitest + fast-check test setup. The implementation follows the design's layered architecture (State → Storage → Validation → Computation → Render → Controller) and builds incrementally: project scaffolding first, then pure logic layers with property-based tests, then DOM/storage layers, then render and controller wiring, then styling and responsive layout, and finally integration tests.

All application logic lives in `js/main.js`, organized into clearly separated sections. Pure functions (validation, computation, serialization) are implemented first so they can be tested independently of the DOM and browser storage. The Chart.js dependency is loaded from a CDN in `index.html`. The implementation language is Vanilla JavaScript (no frameworks, no build step), matching the design document.

Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

## Tasks

- [x] 1. Set up project structure and testing framework
  - [x] 1.1 Create package.json, test configuration, and directory structure
    - Create `package.json` with `vitest`, `fast-check`, and `jsdom` as dev dependencies (pin exact versions)
    - Add npm scripts: `"test": "vitest --run"` (single execution, no watch) and `"test:watch": "vitest"`
    - Create `vitest.config.js` configuring the `jsdom` environment and the `tests/` glob for DOM-touching tests
    - Create the `css/`, `js/`, and `tests/` directories
    - Create `.gitignore` to exclude `node_modules/`
    - _Requirements: 12.3, 11.1_

  - [x] 1.2 Create index.html with full DOM structure and Chart.js CDN
    - Add `<!DOCTYPE html>`, `<head>` with `<meta charset>`, viewport meta tag, and `<link>` to `css/style.css`
    - Add the Chart.js CDN `<script>` tag (pinned version) before `js/main.js`
    - Build the DOM contract from the design: `#totalBalance` (large blue text), the Input_Form with `#itemName`, `#itemAmount`, `#itemCategory`, `#itemType` (Income/Expense selector), `#addTransactionBtn`, the custom category area with `#customCategoryName` and `#addCategoryBtn`, `#sortControl`, `#transactionList` (scrollable), `<canvas id="spendingChart">`, `#themeToggle`, and `#errorArea`
    - Load `js/main.js` with `defer` as the entry point
    - Keep interactive controls to no more than 5 on initial load (Req 12.1) by placing secondary controls (custom category, sort) in a secondary section
    - Use primary section headings larger than secondary labels (Req 12.4)
    - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.3, 4.1, 6.1, 7.1, 8.1, 12.1, 12.4_

- [ ] 2. Implement core state, data models, and constants in main.js
  - [-] 2.1 Define state object, Transaction factory, and constants
    - Define the central mutable `state` object: `{ transactions: [], categories: [], theme: 'light', sortKey: 'amount' }`
    - Implement `createTransaction(input)` factory that trims the name, coerces amount to a number, assigns a unique `id` (via `crypto.randomUUID()` with a `Date.now()+random` fallback), and returns a `Transaction` (`{ id, name, amount, category, type }`)
    - Define storage key constants (`ebv_transactions`, `ebv_categories`, `ebv_theme`), default categories (`['Food','Transport','Fun']`), default theme (`'light'`), default sortKey (`'amount'`), and the chart color palette array
    - _Requirements: 2.4, 5.1, 5.4, 6.5, 7.1, 8.1_

- [ ] 3. Implement validation layer in main.js
  - [ ] 3.1 Implement validateAmount, validateTransactionInput, validateCategoryName
    - `validateAmount(value)`: returns `{ valid, message }`; accepts numeric strings, rejects non-numeric and values outside `[0.01, 999999999.99]` (check boundaries 0, 0.009, 999999999.99, 1000000000)
    - `validateTransactionInput(input)`: returns `{ valid, errors: { field: message } }`; checks name non-empty after trim, amount valid, category selected, type is `'income'` or `'expense'`; reports each offending field by key
    - `validateCategoryName(name, existingCategories)`: returns `{ valid, message }`; trimmed name length 1–30, non-empty, not a case-sensitive duplicate of an existing category
    - Keep these functions pure (no DOM or storage side effects)
    - _Requirements: 2.3, 2.5, 7.1, 7.5_

  - [ ] 3.2 Write property tests for validation
    - Create `tests/validation.test.js`
    - **Property 6: Invalid transaction input is rejected** — for arbitrary inputs with empty fields or out-of-range/non-numeric amounts, `validateTransactionInput` returns `valid === false` with the offending field in `errors`
    - **Property 7: Valid input maps to a matching transaction** — for valid inputs, `createTransaction` produces a transaction with trimmed name, correct amount/category/type, and a unique non-empty id
    - **Property 12: Custom category validation** — `validateCategoryName` returns `valid === true` iff trimmed length is 1–30 and not a duplicate; rejected names are not persisted
    - Tag each test with the design property comment; configure fast-check for at least 100 iterations
    - _Requirements: 2.3, 2.4, 2.5, 7.1, 7.5_

- [ ] 4. Implement computation layer in main.js
  - [ ] 4.1 Implement computeBalance and aggregateSpendingByCategory
    - `computeBalance(transactions)`: sum of income amounts minus sum of expense amounts; empty list returns 0
    - `aggregateSpendingByCategory(transactions)`: group expense transactions by category, sum amounts, return `{ labels, data }` excluding categories with total less than or equal to 0; stable insertion order of first appearance
    - Keep both functions pure
    - _Requirements: 1.4, 4.1_

  - [ ] 4.2 Implement sortTransactions, serializeTransactions, deserializeTransactions
    - `sortTransactions(transactions, sortKey)`: returns a new array sorted ascending by `amount` (numeric) or `category` (case-insensitive `localeCompare`); stable for equal keys (equal-key transactions keep their original relative order)
    - `serializeTransactions(transactions)`: JSON.stringify the transaction array
    - `deserializeTransactions(json)`: JSON.parse, validate each entry, return `{ valid: Transaction[], invalid: number }`; discard invalid entries and count them; never throws (catch SyntaxError)
    - Keep all functions pure
    - _Requirements: 5.3, 5.7, 8.2, 8.3, 8.4_

  - [ ] 4.3 Write property tests for balance and aggregation
    - Create `tests/computation.test.js` (balance and aggregation section)
    - **Property 1: Balance computation** — `computeBalance` equals sum(income) minus sum(expense); empty list returns 0
    - **Property 2: Aggregation correctness and zero-total exclusion** — every returned label is an expense category with total greater than 0, data values are correct sums, each qualifying category appears exactly once
    - Tag with property comments; at least 100 iterations
    - _Requirements: 1.4, 4.1_

  - [ ] 4.4 Write property tests for sort and serialization
    - Create `tests/sort-serialize.test.js`
    - **Property 3: Stable ascending sort by key** — sorted sequence is non-decreasing by `sortKey` and equal-key transactions preserve original relative order
    - **Property 4: Transaction serialization round-trip** — serializing then deserializing a valid set yields an equivalent set (same ids, names, amounts, categories, types)
    - **Property 5: Invalid storage data is discarded** — for payloads mixing valid and invalid entries, `deserializeTransactions` returns exactly the valid entries and discards every invalid one, never throwing
    - Tag with property comments; at least 100 iterations
    - _Requirements: 5.3, 5.7, 8.2, 8.3, 8.4_

- [ ] 5. Implement storage layer in main.js
  - [ ] 5.1 Implement load/save functions for transactions, categories, theme
    - `loadTransactions()`: read `ebv_transactions`, `JSON.parse` (catch SyntaxError), run each entry through validation, discard invalid entries (Req 5.7), return valid array; if localStorage access throws, treat as empty
    - `saveTransactions(transactions)`: serialize and write; wrap `setItem` in try/catch; return `true` on success, `false` on `QuotaExceededError`/`SecurityError`
    - `deleteTransactionById(id)`: remove the transaction from persistence; wrap in try/catch; return success boolean
    - `loadCategories()`: read `ebv_categories`, merge defaults with custom, discard invalid; default `['Food','Transport','Fun']`
    - `saveCategories(categories)`: write with try/catch; return boolean
    - `loadTheme()`: read `ebv_theme`; validate against `'light'`/`'dark'`; fall back to `'light'` (Req 6.5)
    - `saveTheme(theme)`: write with try/catch; return boolean
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.3, 6.4, 6.5, 7.3, 7.4_

  - [ ] 5.2 Write property tests for storage, deletion, and failure handling
    - Create `tests/storage.test.js` using a mockable localStorage
    - **Property 8: Delete removes exactly the targeted transaction** — for a random set and a random member, removing by `id` removes exactly that one and leaves the rest in original relative order
    - **Property 9: Storage failure retains the transaction and shows an error** — for mocked storage that throws, the transaction is retained in session state and an error message is displayed
    - **Property 11: Theme persistence round-trip** — saving a theme then loading it yields the same value
    - **Property 13: Custom category persistence round-trip** — saving a category set then loading it yields the same set
    - Tag with property comments; at least 100 iterations
    - _Requirements: 3.4, 3.6, 5.5, 6.3, 6.4, 7.4_

- [ ] 6. Implement render layer in main.js
  - [ ] 6.1 Implement renderBalance, renderList, renderChart with empty states
    - `renderBalance(transactions)`: compute balance and update `#totalBalance` text (currency-formatted)
    - `renderList(transactions, sortKey)`: rebuild `#transactionList` rows with name, amount, category, type, and a Delete button each; show "no transactions available" message when empty (Req 3.5)
    - `renderChart(transactions)`: aggregate spending by category, update or create the Chart.js pie instance on `#spendingChart`; show "no spending data" message when no expense transactions (Req 4.3); guard on `typeof Chart === 'undefined'` when CDN fails
    - Bail out safely on missing DOM nodes (defensive querySelector checks)
    - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.3, 10.1_

  - [ ] 6.2 Implement renderCategoryOptions, applyTheme, showError, clearErrors
    - `renderCategoryOptions(categories)`: rebuild the `#itemCategory` select options from the category set
    - `applyTheme(theme)`: set `data-theme` attribute and update `#themeToggle` label
    - `showError(message, field?)`: display inline or area error messages in `#errorArea` / field
    - `clearErrors()`: remove displayed error messages
    - _Requirements: 2.2, 6.1, 6.2, 7.2_

  - [ ] 6.3 Write unit tests for rendering, empty states, and theme
    - Create `tests/render.test.js` using jsdom
    - Assert form structure: name/amount/category/type inputs and add button present; category select initially lists Food, Transport, Fun (Req 2.1, 2.2)
    - Assert list rendering: representative sets show every transaction name, amount, category, and one Delete button per row (Req 3.1, 3.3)
    - Assert empty states: no transactions shows no-transactions message, no-spending chart message, and zero balance (Req 3.5, 4.3, 5.6)
    - Assert theme default: loading with no saved theme applies light (Req 6.5)
    - Assert sort control offers amount and category options (Req 8.1)
    - _Requirements: 2.1, 2.2, 3.1, 3.3, 3.5, 4.3, 5.6, 6.5, 8.1_

- [ ] 7. Implement controller and event handlers in main.js
  - [ ] 7.1 Implement handleAddTransaction and handleDeleteTransaction
    - `handleAddTransaction(event)`: prevent default, validate input via `validateTransactionInput`; if invalid call `showError` for offending fields and stop; if valid create a Transaction, attempt `saveTransactions`, on failure retain the transaction in state and `showError` (Req 5.5), on success clear form fields and re-render balance, list, and chart
    - `handleDeleteTransaction(id)`: attempt `deleteTransactionById`; on failure keep the row and `showError` (Req 3.6); on success remove from state and re-render
    - _Requirements: 1.2, 2.3, 2.4, 2.5, 3.4, 3.6, 5.1, 5.5, 10.1_

  - [ ] 7.2 Implement handleThemeToggle, handleSortChange, handleAddCategory
    - `handleThemeToggle()`: flip theme, `saveTheme`, `applyTheme` (Req 6.2, 6.3)
    - `handleSortChange(sortKey)`: set `state.sortKey` and `renderList` (Req 8.1–8.4)
    - `handleAddCategory()`: validate name via `validateCategoryName`; if invalid `showError` and do not persist (Req 7.5); if valid add to state, `saveCategories`, `renderCategoryOptions`
    - _Requirements: 6.2, 6.3, 7.1, 7.2, 7.3, 7.5, 8.1, 8.2, 8.3, 8.4_

  - [ ] 7.3 Implement handleDOMContentLoaded initialization and event wiring
    - `handleDOMContentLoaded()`: run the initialization flow — `loadTheme` then `applyTheme`, `loadCategories` then `renderCategoryOptions`, `loadTransactions` then `renderBalance`, `renderList`, `renderChart`
    - Attach all event listeners (`#addTransactionBtn`, `#addCategoryBtn`, `#sortControl`, `#themeToggle`, and per-row Delete buttons via event delegation)
    - Wire the full flow: user action → controller → mutate state → persist → re-render views → update Chart.js
    - _Requirements: 5.3, 5.4, 5.6, 6.4, 6.5, 7.4, 10.2, 10.3, 12.3_

- [ ] 8. Implement CSS styling and responsive layout
  - [ ] 8.1 Create CSS theme variables, base styles, and component styles
    - Define CSS custom properties for light and dark themes (`[data-theme="light"]`, `[data-theme="dark"]`) controlling background, text, card, and accent colors
    - Style `#totalBalance` in blue, larger than any other text element (Req 1.1)
    - Style the Input_Form, Transaction_List (scrollable), chart container (fixed height), theme toggle, sort control, and error area
    - Set body text font-size to at least 14px and maintain contrast ratio at least 4.5:1 between text and background (Req 12.2)
    - Make primary section headings larger than secondary labels (Req 12.4)
    - _Requirements: 1.1, 3.2, 12.1, 12.2, 12.4_

  - [ ] 8.2 Create responsive layout and media queries
    - Layout: Total_Balance at top, Input_Form below it, Transaction_List and Spending_Chart below the Input_Form (Req 9.1)
    - At viewport width at least 768px: Transaction_List and Spending_Chart side-by-side (Req 9.2)
    - At viewport width less than 768px: stack Transaction_List above Spending_Chart vertically (Req 9.3)
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integration tests and end-to-end verification
  - [ ] 10.1 Write integration tests for add/view/delete flow and initialization
    - Create `tests/integration.test.js` using jsdom and mocked/local storage
    - Initialization smoke: app loads from empty storage with no setup and no network calls, renders empty initial state within 500ms (Req 5.4, 5.6, 10.3, 12.3)
    - End-to-end add/view/delete: add a transaction, confirm balance/list/chart update, delete it, confirm they update again (Req 3.4, 4.2)
    - Storage wiring: create persists, delete removes, theme change persists, added category persists (Req 5.1, 5.2, 6.3, 7.3)
    - _Requirements: 3.4, 4.2, 5.1, 5.2, 5.4, 5.6, 6.3, 7.3, 10.3, 12.3_

  - [ ] 10.2 Write responsive layout and accessibility tests
    - Create `tests/layout.test.js` using jsdom
    - Responsive layout: at viewport width at least 768px the list and chart are side-by-side; below 768px they stack with list above chart (Req 9.1, 9.2, 9.3)
    - Accessibility: assert no more than 5 interactive controls on initial load (Req 12.1), body font-size at least 14px (Req 12.2), and primary headings larger than secondary labels (Req 12.4)
    - _Requirements: 9.1, 9.2, 9.3, 12.1, 12.2, 12.4_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
- The design uses Vanilla JavaScript (no frameworks, no build step); all logic lives in `js/main.js`
- Tasks writing to the same file are scheduled in different waves to avoid conflicts

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3"] },
    { "id": 5, "tasks": ["4.4", "5.1"] },
    { "id": 6, "tasks": ["5.2", "6.1"] },
    { "id": 7, "tasks": ["6.2", "8.1"] },
    { "id": 8, "tasks": ["6.3", "7.1"] },
    { "id": 9, "tasks": ["7.2", "8.2"] },
    { "id": 10, "tasks": ["7.3"] },
    { "id": 11, "tasks": ["10.1", "10.2"] }
  ]
}
```
