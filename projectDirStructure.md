<!-- 
Backend Directory Structure
 -->
backend/
└── controller/
    └── 
└── middleware/
    └── 
└── model/
    └── 
└── routes/
    └── 
└── utils/
    └── 
└── index.ts


<!-- 
Frontend Directory Structure
 -->
src/
└── app/
    ├── core/                   # Singleton services, guards, and interceptors
    │   ├── guards/             # AuthGuard, AdminGuard
    │   ├── interceptors/       # AuthInterceptor, ErrorInterceptor
    │   ├── services/           # AuthService, ApiService
    │   └── models/             # Global interfaces (User, Order)
    │
    ├── shared/                 # Reusable UI components, pipes, and directives
    │   ├── components/         # Custom buttons, loaders, product-cards
    │   ├── directives/         # Hover effects, input masks
    │   └── pipes/              # Currency formatting, search filters
    │
    ├── features/               # Lazy-loaded business modules
    │   ├── products/           # Product list, details, and search
    │   ├── cart/               # Cart management, side-drawer cart
    │   ├── checkout/           # Payment gateway, shipping info
    │   └── auth/               # Login, registration, forgot password
    │
    ├── layout/                 # Main application skeleton
    │   ├── header/             # Navbar with search and cart icon
    │   ├── footer/             # Links and copyright info
    │   └── main-layout/        # Wrapper component with <router-outlet>
    │
    ├── assets/                 # Static images, icons, and themes
    └── environments/           # App configurations (Dev vs. Prod)