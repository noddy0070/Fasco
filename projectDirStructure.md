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
mockData/

public/
    └── assets/
            ├── Images          # Static images and icon
            ├── Fonts           # local fonts
            ├── Logo            # logo and things like favicon, and logo for manifest
            └── Data            # static data present in our website 
src/
└── app/
    ├── store/
    │   ├── actions/            # what happened action performed
    │   ├── reducers/           # it will update your state
    │   ├── effects/            # post reducer functionality not always needed (optional)
    │   └── selectors/          # get data 
    │
    ├── core/                   # Singleton services, guards, and interceptors -> ONLY ONE IN THE ENTIRE APP
    │   ├── guards/             # AuthGuard, AdminGuard -> Access controller like middleware
    │   ├── interceptors/       # AuthInterceptor, ErrorInterceptor -> Managing token like cookies and all
    │   ├── services/           # AuthService, ApiService -> They will interact with our backend
    │   └── models/             # Global interfaces (User, Order) ->Entities should be same as in database schema
    │
    ├── shared/                 # Reusable UI components, pipes, and directives
    │   ├── components/         # Custom buttons, loaders, product-cards ->
    │   ├── directives/         # Hover effects, input masks -> Custom DOM events like lazy loading, debouncing
    │   └── pipes/              # Currency formatting, search filters
    │
    ├── features/               # Lazy-loaded business modules -> all the product pages
    │   ├── products/           # Product list, details, and search
    │   ├── cart/               # Cart management, side-drawer cart
    │   ├── checkout/           # Payment gateway, shipping info
    │   └── auth/               # Login, registration, forgot password
    │
    ├── layout/
    |   ├── User/
    |   │   ├── header/          # Main application skeleton
    |   |   └── footer/          # Links and copyright info
    │   ├── Admin/               # Navbar with search and cart icon
    |   │   ├── header/          # Main application skeleton
    |   |   └── footer/          # Links and copyright info           
    │   └── main-layout/         # Wrapper component with <router-outlet>
    │
│   └── environments/           # App configurations (Dev vs. Prod)
└── styles/
    ├── themes/
    └── styles.scss
