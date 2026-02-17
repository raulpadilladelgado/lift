# Custom Instructions for AI Development (agents.md)

## 🎯 Project Profile: PWA (React 19 + Vite)
This project is a PWA focused on **absolute simplicity** and **human maintainability**. The code must be boring, predictable, and robust.

**Tech Stack:**
- **Framework:** React 19 (Hooks, Suspense, Native APIs).
- **Language:** TypeScript (Strict Mode).
- **Styling:** Tailwind CSS (Utility-first, no unnecessary abstractions).
- **Testing:** Vitest + React Testing Library.
- **Persistence:** LocalStorage (Offline-first strategy).
- **Icons:** Lucide React.

---

## 🛠️ Development Principles

### 1. Simplicity and Maintainability (KISS)
- **Simple Solutions:** Do not install external dependencies if it can be solved with native Web APIs or a simple Hook.
- **Readable Code:** Code should explain the "what" by itself. Comments should explain the "why".
- **Small Components:** Maximum 100-150 lines per file. If it grows, split following SOLID principles.

### 2. Clean Architecture & SOLID
- **S (Single Responsibility):** One component = One visual function. One Hook = One state logic.
- **O/P (Open/Closed):** Prefer component composition (`children`) over complex conditionals.
- **D (Dependency Inversion):** LocalStorage services must be injectable or easily mockable in tests.
- **Folder Structure:**
  - `/src/components`: Pure UI and composition.
  - `/src/hooks`: Business logic and persistence.
  - `/src/services`: Pure utilities and LocalStorage adapters.
  - `/src/types`: TypeScript definitions.

### 3. Strict TypeScript
- Usage of `any` is strictly prohibited.
- Define interfaces for all Props and "storage" responses.
- Use `Readonly` for states that should not be directly mutated.

---

## 🧪 Testing Strategy (Vitest)
**Golden Rule:** Code without tests does not exist. Every feature requires:
1. **Unit Tests:** For logic in `/services` and `/hooks`.
2. **Integration Tests:** For components in `/components` simulating real user interactions.
3. **Mocking:** Mock LocalStorage only when necessary to validate quota failures or parsing errors.

---

## 🤖 AI Response Protocol
For every requested task, the response must follow this order:
1. **Proposal:** Brief technical explanation of the solution.
2. **Types:** Definition of necessary interfaces.
3. **Logic:** Implementation of Service or Custom Hook (with LocalStorage error handling).
4. **UI:** React component using direct Tailwind classes.
5. **Tests:** Complete `.test.tsx` file using Vitest covering the happy path and one edge case.
6. **Maintenance Note:** Why this solution is the simplest and most maintainable