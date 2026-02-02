# 🏋️ LIFT - Minimalist Gym Workout Tracker

A beautiful, iOS-styled Progressive Web App (PWA) for tracking your gym workouts. Built with React, TypeScript, and designed to work offline-first.

## ✨ Features

- **📊 Exercise Tracking**: Log weight and reps for each exercise
- **💪 Muscle Group Organization**: Organize exercises by muscle groups
- **📈 Progress Insights**: Track your progression over time with detailed statistics
- **📱 PWA Support**: Install on your device and use offline
- **🎨 iOS-Style Design**: Beautiful, native-feeling interface
- **🌐 i18n Support**: Spanish and English translations
- **💾 Backup/Restore**: Export and import your data as JSON
- **🎯 Smart Progression**: Tracks any variation in weight or reps as progress

## 🚀 Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Vitest** - Testing Framework (26 tests)
- **LocalStorage** - Data Persistence
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lift.git
   cd lift
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

All 26 tests are comprehensive unit tests for the progression logic and data management.

## 📱 Installing as PWA

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the three dots menu
3. Select "Install App"

## 📂 Project Structure

```
lift/
├── components/          # React components
│   ├── BottomNav.tsx           # Navigation between screens
│   ├── ExerciseCard.tsx         # Exercise logging card
│   ├── InsightsScreen.tsx       # Progress insights
│   ├── MuscleGroupCard.tsx      # Muscle group selector
│   └── SettingsScreen.tsx       # Backup/restore settings
├── services/           # Business logic
│   └── storageService.ts        # LocalStorage management
├── utils/             # Utilities
│   ├── progression.ts           # Progression calculation (tested)
│   └── translations.ts          # i18n translations
├── types.ts           # TypeScript types
├── App.tsx           # Main app component
└── index.tsx         # Entry point
```

## 🎯 Key Features Explained

### Smart Progression Tracking
The app tracks progression based on **any variation** in weight or reps:
- ✅ Increasing weight counts as progress
- ✅ Increasing reps counts as progress
- ✅ Decreasing weight counts as progress (deload cycles)
- ✅ Decreasing reps counts as progress

This ensures your training variations are properly tracked, including strategic deloads and rep PRs.

### Three Main Screens

1. **Home** 🏠
   - View muscle groups
   - Quick access to exercises
   - Log workouts

2. **Insights** 📊
   - See your 3 most recent progressions
   - Track progression timeline
   - View statistics

3. **Settings** ⚙️
   - Export workout data
   - Import from backup
   - Manage your data

### Data Storage
All data is stored locally using `localStorage`. Your data never leaves your device. Use the backup/restore feature to transfer data between devices or keep as insurance.

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or code contributions.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Tips
- Tests are in `*.test.ts` files
- Run `npm test` to verify changes
- Use `npm run dev` for hot reload during development
- Check `npm run build` before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Inspired by iOS design language
- Built with ❤️ for fitness enthusiasts

---

**LIFT** - Track your progress, crush your goals 💪
