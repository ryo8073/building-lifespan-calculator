# Cursor Rules for Building Lifespan Calculator App (Agent Architecture)

## 1. General Architecture & Design
# @rule: Adhere to the Agent-based architecture described in PRD and PROJECT_STRUCTURE.md.
# @rule: RootAgent (in `app/layout.tsx`, `app/page.tsx`) orchestrates UI and Agent interactions.
# @rule: Specialized Agents (StatutoryLifespanAgent, UsedAssetCalculatorAgent) handle specific feature logic and UI sections. Their logic resides in `features/<agent-name>/` and UI in `app/(agents)/<agent-name>/`.
# @rule: DataManagementAgent (logic in `features/data-management/`) provides data and calculation primitives.
# @rule: Prioritize clear separation of concerns: UI (React Components), state management (Hooks, Zustand/Jotai), business logic (services in `features/`).

## 2. Component Design & Structure (Next.js App Router)
# @rule: Create functional components using React Hooks. Prefer Server Components where possible for non-interactive parts. Use Client Components (`"use client"`) for interactive UI.
# @rule: Shared UI components in `/components/ui` (generic) and `/components/shared` (project-specific).
# @rule: Feature-specific UI components in `features/<agent-name>/components/`.
# @rule: Props should be clearly typed using interfaces, often defined in `features/<agent-name>/types.ts`.

## 3. State Management
# @rule: Use `useState` for simple, local component state.
# @rule: For complex state within a feature or shared state between components of an Agent, use custom hooks (`features/<agent-name>/hooks/`) encapsulating `useState` and `useReducer`.
# @rule: For global state or cross-Agent state communication (e.g., selected statutory useful life, theme), use Zustand or Jotai (configure store in `lib/store.ts` or similar). Minimize global state.
# @rule: `StatutoryLifespanAgent`'s output (statutory useful life) should be made available to `UsedAssetCalculatorAgent`, preferably via the chosen state management solution or props drilling if simple.

## 4. Data Handling & Logic (Implemented in `features/`)
# @rule: Static data (`buildingLifespanData.ts`) imported via `features/data-management/`.
# @rule: Filtering logic for F1 (StatutoryLifespanAgent) in `features/statutory-lifespan/services/`.
# @rule: Calculation logic for F2 (UsedAssetCalculatorAgent) in `features/used-asset-calculator/services/`, utilizing primitives from `features/data-management/usedAssetCalculationLogic.ts`.
# @rule: All calculation formulas and conditions from PRD section 4 (D2) must be accurately implemented.
# @rule: Rounding for useful life: 1-year未満切り捨て, result < 2 years => 2 years.

## 5. TypeScript & Typing
# @rule: All code must be in TypeScript. Strict mode enabled.
# @rule: Define feature-specific types in `features/<agent-name>/types.ts`. Globally shared types in `lib/types.ts` (if any).
# @rule: Strictly avoid `any`. Use specific types, `unknown` with type guards, or generics.
# @rule: Clearly type function parameters, return values, and hook signatures.

## 6. UI/UX & Forms (Reflect PRD Section 5)
# @rule: Implement UI according to PRD's UI/UX requirements, including modern design, dark mode, and microinteractions.
# @rule: Use Tailwind CSS for styling. Responsive design is critical.
# @rule: For forms (F1, F2), consider React Hook Form for validation and state management.
# @rule: Ensure all interactive elements are accessible (WCAG 2.1 AA). Use semantic HTML and ARIA attributes appropriately.
# @rule: Implement dynamic filtering for F1 as described in PRD. "Thickness" dropdown conditional visibility.
# @rule: Calculation details (F2) and logic reference (F3) should be clear and potentially collapsible.
# @rule: Reset functionality (F4) must clear all relevant Agent states.

## 7. Code Style & Readability
# @rule: Format code using Prettier. Enforce ESLint rules.
# @rule: Write JSDoc comments for exported functions/hooks, complex logic.
# @rule: Use descriptive names for variables, functions, components, and Agents' modules.
# @rule: Keep functions/components small and focused (Single Responsibility Principle).

## 8. Testing
# @rule: Write unit tests (Jest) for business logic in `features/` (services, hooks).
# @rule: Write integration/component tests (React Testing Library) for UI components and Agent interactions.
# @rule: Aim for high test coverage for critical calculation and filtering logic.

## 9. Agent-Specific Instructions
# @rule: When working on `StatutoryLifespanAgent`: focus on dynamic dropdowns, data filtering from `buildingLifespanData.ts`, and outputting the selected useful life.
# @rule: When working on `UsedAssetCalculatorAgent`: focus on form handling, calling calculation logic from `usedAssetCalculationLogic.ts`, and displaying results/breakdown.
# @rule: When working on `DataManagementAgent`: ensure data structures are correct and calculation primitives are accurate and pure.