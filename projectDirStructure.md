<!-- 
Backend Directory Structure
 -->
backend/
├── index.ts                     # Main entry point
├── environment.d.ts             # Environment type definitions
├── package.json                 # Dependencies and scripts
│
├── controller/                  # Request handlers for different routes
│   └── auth/
│       ├── auth.controller.ts   # Authentication logic
│       └── verify.controller.ts # Verification logic
│
├── middleware/                  # Express middleware
│   └── api.middleware.ts        # API middleware
│
├── model/                       # Database models (MongoDB schemas)
│   ├── brand.model.ts
│   ├── cart.model.ts
│   ├── category.model.ts
│   ├── offer.model.ts
│   ├── orders.model.ts
│   ├── product.model.ts
│   ├── review.model.ts
│   ├── user.model.ts
│   └── wishlist.model.ts
│
├── model.interfaces/            # TypeScript interfaces matching models
│   ├── brand.interface.ts
│   ├── cart.interface.ts
│   ├── category.interface.ts
│   ├── customEnum.ts            # Enums used across models
│   ├── offer.interface.ts
│   ├── orders.interface.ts
│   ├── product.interface.ts
│   ├── review.interface.ts
│   ├── user.interface.ts
│   └── wishlist.interface.ts
│
├── routes/                      # API route definitions
│   ├── main.route.ts            # Main route aggregator
│   └── auth/
│       └── auth.route.ts        # Authentication routes
│
└── utils/                       # Utility functions
    └── mailService.ts           # Email sending service


<!-- 
Frontend Directory Structure
 -->
public/
├── assets/                      # Static assets
│   ├── css/                     # CSS libraries
│   │   ├── owl.carousel.min.css
│   │   ├── owl.theme.default.min.css
│   │   └── swiper-bundle.min.css
│   ├── data/                    # Static JSON data
│   ├── fonts/                   # Custom fonts
│   │   ├── Digital_Numbers/
│   │   ├── Manrope/
│   │   ├── Oregano/
│   │   ├── Poppins/
│   │   ├── Roboto/
│   │   └── Volkhov/
│   ├── icons/                   # Icon assets
│   └── images/                  # Static images
│       ├── auth/
│       ├── brands/
│       ├── footer/
│       ├── home/
│       │   ├── blog/
│       │   ├── follow/
│       │   ├── hero/
│       │   ├── limited/
│       │   ├── peaky-blinder/
│       │   └── trend/
│
src/
├── index.html                   # Main HTML entry point
├── main.ts                      # Angular bootstrap
├── styles.css                   # Global styles
│
├── app/
│   ├── app.ts                   # Main component
│   ├── app.html                 # Component template
│   ├── app.css                  # Component styles
│   ├── app.config.ts            # App configuration
│   ├── app.routes.ts            # Routing configuration
│   ├── app.spec.ts              # App component tests
│
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── api/
│   │   │   └── api.endpoints.ts # API endpoint constants
│   │   ├── guards/              # Route guards (AuthGuard, AdminGuard, etc.)
│   │   ├── interceptors/        # HTTP interceptors (Auth, Error, etc.)
│   │   ├── models/              # Global interfaces (User, Product, Order, etc.)
│   │   ├── services/
│   │   │   └── auth/            # Authentication service
│   │   └── store/               # Global state management
│   │       ├── user-store.ts    # User state management
│   │       └── user-store.spec.ts
│
│   ├── shared/                  # Reusable components, directives, pipes
│   │   ├── components/          # Shared UI components (buttons, loaders, cards, etc.)
│   │   ├── directives/          # Custom directives (lazy loading, debouncing, etc.)
│   │   ├── pipes/               # Custom pipes (currency, search filters, etc.)
│   │   └── styles/              # Shared styles
│
│   ├── features/                # Feature modules (lazy-loaded)
│   │   ├── auth/                # Authentication feature
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── signup-verification/
│   │   └── home/                # Home page feature
│   │       ├── home.ts
│   │       ├── home.html
│   │       ├── home.css
│   │       ├── home.spec.ts
│   │       └── sections/
│
│   ├── layout/                  # Layout components
│   │   ├── auth-frame/          # Authentication layout frame
│   │   │   ├── auth-frame.ts
│   │   │   ├── auth-frame.html
│   │   │   ├── auth-frame.css
│   │   │   └── auth-frame.spec.ts
│   │   ├── cta/                 # Call-to-action layout
│   │   │   ├── cta.ts
│   │   │   ├── cta.html
│   │   │   ├── cta.css
│   │   │   └── cta.spec.ts
│   │   ├── footer/              # Footer layout
│   │   │   ├── footer.ts
│   │   │   ├── footer.html
│   │   │   └── footer.css
│   │   └── header/              # Header/navbar layout
│   │
│   └── environments/            # Environment configurations
│       ├── environments.ts      # Development environment
│       └── environments.prod.ts # Production environment
│
├── angular.json                 # Angular CLI configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # TypeScript app configuration
├── tsconfig.spec.json           # TypeScript spec (test) configuration
└── package.json                 # Dependencies and scripts
