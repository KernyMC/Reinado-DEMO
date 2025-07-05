
# ESPE Beauty Pageant Voting System - Web Client

A comprehensive React TypeScript application for managing beauty pageant voting with role-based access control.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Start Storybook
npm run storybook

# Lint code
npm run lint

# Format code
npm run format
```

## 🏗️ Architecture

### Tech Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router v6** for navigation
- **React Query** for state management
- **i18next** for internationalization (Spanish/English)
- **Shadcn/UI** for component library
- **Recharts** for data visualization

### Folder Structure
```
src/
├── app/                # Global app configuration
│   ├── AppRouter.tsx   # Main routing configuration
│   └── I18nProvider.tsx # Internationalization setup
├── layouts/            # Layout components
│   ├── CoreLayout.tsx  # Main app layout (sidebar + header)
│   └── AuthLayout.tsx  # Authentication layout
├── pages/              # Route-specific pages
│   ├── Login/          # Authentication pages
│   ├── UserVotes/      # Public voting interface
│   ├── JudgeVotes/     # Judge scoring interface
│   ├── Notary/         # Real-time monitoring
│   ├── Admin/          # Event and candidate management
│   ├── SuperAdmin/     # User and system management
│   ├── Forbidden/      # 403 error page
│   └── NotFound/       # 404 error page
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn/UI components (auto-generated)
│   ├── Sidebar.tsx    # Navigation sidebar
│   ├── Header.tsx     # App header with user menu
│   ├── StatusBanner.tsx # Voting status indicator
│   ├── CandidateCarousel.tsx # Candidate display carousel
│   ├── ScoreTable.tsx # Judge scoring interface
│   ├── LiveChart.tsx  # Real-time data visualization
│   ├── LiveResultsTable.tsx # Live voting results
│   └── DrawerForm.tsx # Reusable form drawer
├── features/           # Feature-specific logic
│   └── auth/          # Authentication context and hooks
├── services/           # API service layer (mocked)
├── hooks/              # Custom React hooks
├── mocks/              # MSW mock API handlers
└── assets/             # Static assets
```

## 👥 User Roles & Permissions

### User (Estudiante)
- ✅ View candidates
- ✅ Cast one vote during public voting period
- ✅ View voting status

### Judge (Juez)
- ✅ All User permissions
- ✅ Score candidates in three events:
  - Traje Típico (Typical Costume)
  - Vestido de Gala (Evening Gown)
  - Preguntas y Respuestas (Q&A)
- ✅ Edit scores while events are active

### Notary (Notario)
- ✅ All User permissions
- ✅ Real-time monitoring dashboard
- ✅ Live voting results table
- ✅ View system statistics (read-only)

### Admin (Administrador)
- ✅ All previous permissions
- ✅ Manage event stages (start/close/reset)
- ✅ Manage candidates (add/edit/delete)
- ✅ Generate reports (PDF/CSV)
- ✅ Export voting data

### Super Admin (Super Administrador)
- ✅ All previous permissions
- ✅ User management (roles, status)
- ✅ Send user invitations
- ✅ Global system settings
- ✅ Permissions matrix configuration
- ✅ Vote weight configuration

## 🎨 UI Components

### Core Components
- **StatusBanner**: Displays current voting status (open/closed/coming soon)
- **CandidateCarousel**: Interactive candidate display with voting capability
- **ScoreTable**: Judge scoring interface with sliders (0-10 scale)
- **LiveChart**: Real-time vote distribution visualization
- **LiveResultsTable**: Auto-refreshing results table
- **DrawerForm**: Reusable side panel for forms

### Storybook Documentation
All major components include Storybook stories with interactive controls:
```bash
npm run storybook
```

## 🔧 Configuration

### Environment Setup
All API calls are currently mocked. Replace `// TODO call API` comments with actual endpoints when backend is ready.

### Demo Accounts
For testing different roles:
- `user@espe.edu.ec` - Regular user
- `judge@espe.edu.ec` - Judge
- `notary@espe.edu.ec` - Notary  
- `admin@espe.edu.ec` - Administrator
- `super@espe.edu.ec` - Super Administrator

Password: Any value (mocked authentication)

### Language Support
- Spanish (es) - Default
- English (en)
Toggle via header language selector

## 📱 Features

### Public Voting
- Elegant candidate carousel with high-quality images
- One-vote-per-user enforcement
- Real-time status updates
- Success notifications

### Judge Scoring
- Tabbed interface for three events
- 0-10 slider scoring system
- Individual save/confirmation per candidate
- Event status awareness (active/closed)

### Real-time Monitoring
- Live KPI dashboard
- Auto-refreshing charts and tables
- Activity feed
- Performance metrics

### Administrative Tools
- Complete event lifecycle management
- Candidate CRUD operations
- Advanced reporting with date filters
- Multiple export formats (PDF/CSV)

### User Management
- Role-based access control
- User invitation system
- Permission matrix configuration
- Activity monitoring

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Test specific component
npm test CandidateCarousel
```

Key test coverage:
- Voting functionality (one vote per user)
- Score submission and validation
- Role-based navigation
- Component interactions

## 🚀 Deployment

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

The build is optimized and ready for deployment to any static hosting service.

## 🔄 Backend Integration

When ready to connect to backend APIs:

1. Replace all `// TODO call API` comments with actual HTTP calls
2. Configure axios/fetch in `src/services/api.ts`
3. Update mock data with real API responses
4. Remove MSW handlers from `src/mocks/handlers.ts`
5. Add environment variables for API endpoints

## 📋 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier configuration
- Husky pre-commit hooks for code quality

### Component Patterns
- Functional components with hooks
- Props interfaces for all components
- Consistent error handling
- Loading states for all async operations

### State Management
- React Context for global state (auth, i18n)
- React Query for server state
- Local useState for component state

### Styling
- Tailwind CSS utility classes
- Custom design tokens in `tailwind.config.ts`
- Responsive design (mobile-first)
- Dark mode support structure (not implemented)

## 🐛 Known Issues & Limitations

1. All data is currently mocked - no persistent storage
2. File upload for candidate images not implemented (URL only)
3. Email notifications are simulated
4. Real-time features use polling (no WebSocket)
5. Advanced analytics dashboard pending

## 📞 Support

For technical questions or issues:
1. Check the component documentation in Storybook
2. Review the TODO comments for backend integration points
3. Consult the permission matrix in SuperAdmin settings

## 🎯 Next Steps

1. **Backend Integration**: Replace mock APIs with real endpoints
2. **File Upload**: Implement image upload for candidates
3. **Real-time**: Add WebSocket support for live updates
4. **Analytics**: Enhanced reporting and analytics dashboard
5. **Mobile App**: React Native version for mobile access
6. **Performance**: Implement virtual scrolling for large datasets
7. **Accessibility**: Complete WCAG 2.1 compliance audit

---

Built with ❤️ for ESPE Beauty Pageant 2024
