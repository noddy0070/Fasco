# API Documentation

## 1) Purpose

This document describes all API endpoints exposed by the Express backend so the QA/testing team and frontend developers can validate and integrate backend behavior end-to-end.

**Project:** fasco-ecommerce  
**Date:** 2026-05-27

---

## 2) Base URLs

- **Local base URL:** `http://localhost:5000/api`
- **Swagger UI:** `http://localhost:5000/api-docs`
- **Environment source:** `backend/environment.d.ts`

---

## 3) Common Request Behavior

- **Body format:** `application/json`
- **Auth mechanism:** HTTP-only `token` cookie containing a signed JWT
- **NoSQL sanitization:** All incoming request bodies are sanitized — keys prefixed with `$` are stripped before reaching controllers
- **Rate limiting:** 20 requests per 15 minutes on:
  - `POST /api/auth/login`
  - `POST /api/auth/signup`
  - `POST /api/admin/auth/login`

---

## 4) Authentication & Middleware

### `requireUser` (`middleware/auth.middleware.ts`)

- Extracts the `token` cookie → verifies JWT → attaches `req.user = { userId, email, role }` to the request
- Returns `401` if the token is missing or invalid

### `requireRole(allowedRoles[])` (`middleware/rbac.middleware.ts`)

- Same cookie extraction as `requireUser` → additionally checks that `decoded.role` is in the allowed roles list
- Returns `401` if token is missing/invalid
- Returns `403` if the role is insufficient
- Attaches `req.admin = { userId, email, role }` to the request

### Admin Role Enum

| Role | Permissions |
|---|---|
| `super-admin` | Full access to all admin endpoints |
| `user-admin` | User management only |
| `inventory-management` | Products, brands, categories, collections |

---

## 5) Standard API Response Contract

Most endpoints return a wrapped response:

```json
// Success
{
  "success": true,
  "data": { "...": "..." }
}

// Failure
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Optional human-readable message"
}
```

---

## 6) Endpoint Summary

| Feature | Method | Endpoint | Auth Required | Notes |
|---|---|---|---|---|
| Signup | POST | `/api/auth/signup` | No | Register new user |
| Login | POST | `/api/auth/login` | No | Sets `token` cookie (1h TTL) |
| Logout | GET | `/api/auth/logout` | No | Clears `token` cookie |
| Current user | GET | `/api/auth/me` | Cookie (manual) | Returns user from cookie JWT |
| Verify email | GET | `/api/auth/verify/:token` | No | Email verification link |
| Resend verification | POST | `/api/auth/verify/resend` | No | Resend verification email |
| Forgot password | POST | `/api/auth/forgot-password` | No | Send reset link (15-min JWT) |
| Reset password | POST | `/api/auth/reset-password` | No | Apply new password via token |
| Product list | GET | `/api/products` | No | Paginated product catalog |
| Product by slug | GET | `/api/products/slug/:slug` | No | Product detail page |
| Product by ID | GET | `/api/products/:id` | No | Product detail by MongoDB ID |
| Collection list | GET | `/api/collections` | No | All active collections |
| Collection by slug | GET | `/api/collections/:slug` | No | Single collection page |
| Get cart | GET | `/api/cart` | User JWT | Fetch or create cart |
| Add to cart | POST | `/api/cart/items` | User JWT | Add/increment item |
| Update cart item | PATCH | `/api/cart/items` | User JWT | Set item quantity |
| Remove cart item | DELETE | `/api/cart/items` | User JWT | Remove item |
| Get wishlist | GET | `/api/wishlist` | User JWT | Fetch or create wishlist |
| Add to wishlist | POST | `/api/wishlist/items` | User JWT | Add product |
| Remove from wishlist | DELETE | `/api/wishlist/items` | User JWT | Remove product |
| Order history | GET | `/api/orders` | User JWT | Paginated order list |
| Checkout | POST | `/api/orders/checkout` | User JWT | Place an order |
| Admin login | POST | `/api/admin/auth/login` | No | Sets `token` cookie (8h TTL) |
| Admin logout | GET | `/api/admin/auth/logout` | No | Clears `token` cookie |
| List users | GET | `/api/admin/users` | RBAC | `super-admin`, `user-admin` |
| Get user | GET | `/api/admin/users/:id` | RBAC | `super-admin`, `user-admin` |
| Create user | POST | `/api/admin/users` | RBAC | `super-admin`, `user-admin` |
| Update user | PATCH | `/api/admin/users/:id` | RBAC | `super-admin`, `user-admin` |
| Delete user | DELETE | `/api/admin/users/:id` | RBAC | `super-admin`, `user-admin` |
| List products (admin) | GET | `/api/admin/products` | RBAC | `super-admin`, `inventory-management` |
| Get product (admin) | GET | `/api/admin/products/:id` | RBAC | `super-admin`, `inventory-management` |
| Create product | POST | `/api/admin/products` | RBAC | `super-admin`, `inventory-management` |
| Update product | PATCH | `/api/admin/products/:id` | RBAC | `super-admin`, `inventory-management` |
| Delete product | DELETE | `/api/admin/products/:id` | RBAC | `super-admin`, `inventory-management` |
| Restore product | PATCH | `/api/admin/products/:id/restore` | RBAC | `super-admin`, `inventory-management` |
| List brands | GET | `/api/admin/brands` | RBAC | `super-admin`, `inventory-management` |
| Create brand | POST | `/api/admin/brands` | RBAC | `super-admin`, `inventory-management` |
| Update brand | PATCH | `/api/admin/brands/:id` | RBAC | `super-admin`, `inventory-management` |
| Delete brand | DELETE | `/api/admin/brands/:id` | RBAC | `super-admin`, `inventory-management` |
| List categories | GET | `/api/admin/categories` | RBAC | `super-admin`, `inventory-management` |
| Create category | POST | `/api/admin/categories` | RBAC | `super-admin`, `inventory-management` |
| Update category | PATCH | `/api/admin/categories/:id` | RBAC | `super-admin`, `inventory-management` |
| Delete category | DELETE | `/api/admin/categories/:id` | RBAC | `super-admin`, `inventory-management` |
| List collections (admin) | GET | `/api/admin/collections` | RBAC | `super-admin`, `inventory-management` |
| Get collection (admin) | GET | `/api/admin/collections/:id` | RBAC | `super-admin`, `inventory-management` |
| Create collection | POST | `/api/admin/collections` | RBAC | `super-admin`, `inventory-management` |
| Update collection | PATCH | `/api/admin/collections/:id` | RBAC | `super-admin`, `inventory-management` |
| Delete collection | DELETE | `/api/admin/collections/:id` | RBAC | `super-admin`, `inventory-management` |
| List orders (admin) | GET | `/api/admin/orders` | RBAC | `super-admin` |
| Get order (admin) | GET | `/api/admin/orders/:id` | RBAC | `super-admin` |
| Update order status | PATCH | `/api/admin/orders/:id/status` | RBAC | `super-admin` |
| Analytics overview | GET | `/api/admin/analytics/overview` | RBAC | `super-admin` |
| Revenue chart | GET | `/api/admin/analytics/revenue` | RBAC | `super-admin` |
| Order status breakdown | GET | `/api/admin/analytics/order-status-breakdown` | RBAC | `super-admin` |
| Top products | GET | `/api/admin/analytics/top-products` | RBAC | `super-admin` |

---

## 7) Detailed Endpoint Contracts

### 7.1 Signup

- **Method:** POST
- **URL:** `/api/auth/signup`
- **Rate limited:** Yes (20 req/15 min)

**Request body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "phone": "9876543210",
  "password": "secret123"
}
```

**Expected success response:**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```
HTTP status: `201`

**QA checks:**
- Duplicate email returns failure.
- Missing required fields return validation error.
- A verification email is sent after successful signup.

---

### 7.2 Login

- **Method:** POST
- **URL:** `/api/auth/login`
- **Rate limited:** Yes (20 req/15 min)

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Expected success data shape:**
```json
{
  "id": "string",
  "email": "user@example.com",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe"
}
```

- Sets `token` cookie: HTTP-only, 1-hour TTL, contains `{ userId, email, role }`

**QA checks:**
- Valid credentials return `success: true` and set cookie.
- Invalid credentials return `success: false` with error code.
- Blocked user cannot log in.
- Cookie is present on subsequent authenticated requests.

---

### 7.3 Logout

- **Method:** GET
- **URL:** `/api/auth/logout`

**Expected behavior:**
- Clears the `token` cookie.
- Returns `success: true` (data can be null).

**QA checks:**
- After logout, `GET /api/auth/me` should return an auth failure.

---

### 7.4 Current User (me)

- **Method:** GET
- **URL:** `/api/auth/me`

**Expected success data shape:**
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "user@example.com",
  "phone": "string",
  "role": "customer",
  "isVerified": true,
  "isBlocked": false,
  "createdAt": "2026-05-27T10:00:00.000Z"
}
```

**QA checks:**
- Unauthenticated request returns auth failure.
- Returns current user data when cookie is valid.

---

### 7.5 Email Verification

- **Method:** GET
- **URL:** `/api/auth/verify/:token`

**Expected behavior:**
- Sets `isVerified: true` on the user matching the JWT param.
- Returns `success: true` on valid token.

**QA checks:**
- Valid verification token marks user as verified.
- Expired or invalid token returns failure.

---

### 7.6 Resend Verification Email

- **Method:** POST
- **URL:** `/api/auth/verify/resend`

**Request body:**
```json
{ "email": "user@example.com" }
```

**QA checks:**
- Already-verified users should not get another email (document backend behavior).
- Non-existent email returns failure.

---

### 7.7 Forgot Password

- **Method:** POST
- **URL:** `/api/auth/forgot-password`

**Request body:**
```json
{ "email": "user@example.com" }
```

**Expected behavior:**
- Always returns `success: true` (prevents email enumeration).
- Sends a reset link with a 15-minute JWT to the registered email.

---

### 7.8 Reset Password

- **Method:** POST
- **URL:** `/api/auth/reset-password`

**Request body:**
```json
{
  "token": "jwt-reset-token",
  "newPassword": "newSecret123"
}
```

- `newPassword` minimum length: 6 characters

**QA checks:**
- Valid token + new password updates credentials.
- Expired reset token returns failure.
- Password too short returns validation error.

---

### 7.9 Product List

- **Method:** GET
- **URL:** `/api/products`
- **Auth:** None

**Supported query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page |
| `gender` | string | Filter by gender audience |
| `isTrending` | boolean | Filter trending products |
| `isLimitedOffer` | boolean | Filter limited-offer products |

**Expected success data shape:**
```json
{
  "products": [
    {
      "_id": "string",
      "title": "string",
      "slug": "string",
      "brand": { "title": "string", "slug": "string" },
      "category": { "name": "string", "slug": "string" },
      "variants": [{ "sku": "string", "price": 1299, "stock": 20 }],
      "averageRating": 4.5,
      "totalReviews": 125,
      "isTrending": false,
      "isLimitedOffer": false
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**QA checks:**
- Pagination values are correct for each page.
- Filters narrow results consistently.
- Empty results return `products: []` not a failure.

---

### 7.10 Product by Slug

- **Method:** GET
- **URL:** `/api/products/slug/:slug`
- **Auth:** None

**Expected success data shape:**
```json
{
  "_id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "brand": { "title": "string", "slug": "string" },
  "category": { "name": "string", "slug": "string" },
  "subCategory": { "name": "string", "slug": "string" },
  "gender": "men",
  "tags": ["summer"],
  "isTrending": false,
  "isLimitedOffer": false,
  "averageRating": 4.5,
  "totalReviews": 125,
  "specifications": [{ "title": "Material", "value": "Cotton" }],
  "variants": [
    {
      "sku": "SKU123",
      "price": 1299,
      "discount": { "type": "percentage", "value": 10 },
      "stock": 20,
      "size": "M",
      "color": "Black",
      "colorCode": "#000000",
      "images": [{ "url": "https://...", "alt": "string" }]
    }
  ]
}
```

**QA checks:**
- Slug not found returns proper failure response.
- Product with multiple variants returns all variants.

---

### 7.11 Collection List (Public)

- **Method:** GET
- **URL:** `/api/collections`
- **Auth:** None

**Expected success data shape:**
```json
[
  {
    "slug": "summer-sale",
    "eyebrow": "string",
    "title": "Summer Sale",
    "description": "string",
    "heroImage": { "url": "https://...", "alt": "string" },
    "tabs": [{ "label": "All", "slug": "all" }],
    "sortOptions": [],
    "promo": { "eyebrow": "string", "title": "string", "description": "string", "actions": [] },
    "productFilter": "sale",
    "displayOrder": 1
  }
]
```

**QA checks:**
- Only `isActive: true` collections are returned.
- Results are sorted by `displayOrder` ascending.

---

### 7.12 Cart — Get Cart

- **Method:** GET
- **URL:** `/api/cart`
- **Auth:** User JWT (cookie)

**Expected success data shape:**
```json
{
  "_id": "string",
  "user": "userId",
  "items": [
    {
      "product": { "_id": "string", "title": "string", "slug": "string", "variants": [] },
      "variantSku": "SKU123",
      "quantity": 2,
      "addedAt": "2026-05-27T10:00:00.000Z"
    }
  ],
  "totalItems": 2,
  "totalAmount": 2598
}
```

---

### 7.13 Cart — Add Item

- **Method:** POST
- **URL:** `/api/cart/items`
- **Auth:** User JWT (cookie)

**Request body:**
```json
{
  "productId": "string",
  "variantSku": "SKU123",
  "quantity": 1
}
```

**QA checks:**
- Adding an existing item increments the quantity.
- Adding beyond available stock returns failure.

---

### 7.14 Cart — Update Item

- **Method:** PATCH
- **URL:** `/api/cart/items`
- **Auth:** User JWT (cookie)

**Request body:**
```json
{
  "productId": "string",
  "variantSku": "SKU123",
  "quantity": 3
}
```

**QA checks:**
- Setting `quantity <= 0` removes the item from cart.
- Setting `quantity > stock` returns failure.

---

### 7.15 Cart — Remove Item

- **Method:** DELETE
- **URL:** `/api/cart/items`
- **Auth:** User JWT (cookie)

**Request body:**
```json
{
  "productId": "string",
  "variantSku": "SKU123"
}
```

---

### 7.16 Wishlist — Get Wishlist

- **Method:** GET
- **URL:** `/api/wishlist`
- **Auth:** User JWT (cookie)

**Expected success data shape:**
```json
{
  "_id": "string",
  "user": "userId",
  "items": [
    {
      "product": { "_id": "string", "title": "string", "slug": "string" },
      "variantSku": "SKU123"
    }
  ]
}
```

---

### 7.17 Wishlist — Add Item

- **Method:** POST
- **URL:** `/api/wishlist/items`
- **Auth:** User JWT (cookie)

**Request body:**
```json
{
  "productId": "string",
  "variantSku": "SKU123"
}
```

**QA checks:**
- Adding a duplicate item does not create a second entry.

---

### 7.18 Wishlist — Remove Item

- **Method:** DELETE
- **URL:** `/api/wishlist/items`
- **Auth:** User JWT (cookie)

**Request body:**
```json
{
  "productId": "string",
  "variantSku": "SKU123"
}
```

---

### 7.19 Orders — History

- **Method:** GET
- **URL:** `/api/orders`
- **Auth:** User JWT (cookie)

**Supported query params:** `page`, `limit`

**Expected success data shape:**
```json
{
  "orders": [
    {
      "_id": "string",
      "orderStatus": "pending",
      "items": [
        {
          "title": "string",
          "slug": "string",
          "variantSku": "SKU123",
          "size": "M",
          "color": "Black",
          "price": 1299,
          "finalPrice": 1169,
          "quantity": 1,
          "image": [{ "url": "https://...", "alt": "string" }]
        }
      ],
      "shippingAddress": {
        "fullName": "John Doe",
        "phone": "9876543210",
        "pincode": "110001",
        "state": "Delhi",
        "city": "New Delhi",
        "addressLine1": "string"
      },
      "payment": { "method": "cod", "status": "pending" },
      "subtotal": 1299,
      "discountAmount": 130,
      "shippingCharges": 0,
      "totalAmount": 1169,
      "createdAt": "2026-05-27T10:00:00.000Z"
    }
  ],
  "page": 1,
  "total": 5
}
```

---

### 7.20 Orders — Checkout

- **Method:** POST
- **URL:** `/api/orders/checkout`
- **Auth:** User JWT (cookie)

**Request body:**
```json
{
  "paymentMethod": "cod",
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "pincode": "110001",
    "state": "Delhi",
    "city": "New Delhi",
    "addressLine1": "123 Street Name",
    "addressLine2": ""
  },
  "items": [
    { "productId": "string", "variantSku": "SKU123", "quantity": 1 }
  ],
  "useCart": false
}
```

- Either `items[]` or `useCart: true` must be provided (not both).
- `paymentMethod` values: `cod` | `card` | `upi` | `netbanking`
- Free shipping when `subtotal >= ₹999`, otherwise `+₹49` shipping charge.

**QA checks:**
- Out-of-stock items return failure.
- Both `items` and `useCart: true` together should be documented (current behavior).
- After successful checkout, stock is decremented.
- `useCart: true` optionally clears the user's cart.

---

### 7.21 Admin Login

- **Method:** POST
- **URL:** `/api/admin/auth/login`
- **Rate limited:** Yes (20 req/15 min)

**Request body:**
```json
{
  "email": "admin@example.com",
  "password": "adminSecret"
}
```

**Expected success data shape:**
```json
{
  "_id": "string",
  "email": "admin@example.com",
  "role": "super-admin"
}
```

- Sets `token` cookie: HTTP-only, 8-hour TTL, contains `{ userId, email, role }`

**QA checks:**
- Non-admin roles (customer) cannot log in via this endpoint.
- Blocked admin account returns failure.

---

### 7.22 Admin — Users

All endpoints require roles: `super-admin` or `user-admin`.

#### List Users — `GET /api/admin/users`

**Query params:** `page`, `limit`

**Expected success data shape:**
```json
{
  "users": [
    {
      "_id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "role": "customer",
      "isVerified": true,
      "isBlocked": false,
      "createdAt": "2026-05-27T10:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1
}
```

#### Create User — `POST /api/admin/users`

```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "customer"
}
```
Admin-created users are set as `isVerified: true` automatically.

#### Update User — `PATCH /api/admin/users/:id`

Updatable fields: `firstName`, `lastName`, `phone`, `role`, `isBlocked`, `isVerified`, `gender`, `avatar`

#### Delete User — `DELETE /api/admin/users/:id`

Soft-delete: sets `deletedAt` timestamp (user is not permanently removed).

---

### 7.23 Admin — Products

All endpoints require roles: `super-admin` or `inventory-management`.

#### List Products — `GET /api/admin/products`

**Query params:** `page`, `limit`, `includeDeleted=true`

#### Create Product — `POST /api/admin/products`

**Request body (required fields marked \*):**
```json
{
  "title": "Product Name *",
  "slug": "product-name",
  "description": "string",
  "brand": "brandId",
  "gender": "men",
  "category": "categoryId",
  "subCategory": "categoryId",
  "isActive": true,
  "isTrending": false,
  "isLimitedOffer": false,
  "tags": ["summer", "sale"],
  "specifications": [{ "title": "Material", "value": "Cotton" }],
  "metaTitle": "string",
  "metaDescription": "string",
  "variants": [
    {
      "sku": "SKU123 *",
      "price": 1299,
      "stock": 50,
      "discount": { "type": "percentage", "value": 10 },
      "size": "M",
      "color": "Black",
      "colorCode": "#000000",
      "images": [{ "url": "https://...", "alt": "string" }]
    }
  ]
}
```

- `title` and at least one `variants[]` entry are required.
- `slug` is auto-generated from `title` if not provided.

#### Restore Product — `PATCH /api/admin/products/:id/restore`

Un-soft-deletes a product (sets `deletedAt` to `null`).

---

### 7.24 Admin — Brands

All endpoints require roles: `super-admin` or `inventory-management`.

#### Create / Update Brand

**Body:**
```json
{
  "title": "Nike *",
  "slug": "nike",
  "description": "string",
  "logo": "https://...",
  "isActive": true,
  "isFeatured": false
}
```

**QA checks:**
- Delete brand that is referenced by products (document expected behavior).

---

### 7.25 Admin — Categories

All endpoints require roles: `super-admin` or `inventory-management`.

#### List Categories — `GET /api/admin/categories`

**Query params:** `level` (`gender` | `main` | `sub`), `parent`

#### Create Category — `POST /api/admin/categories`

**Body:**
```json
{
  "name": "T-Shirts *",
  "slug": "t-shirts",
  "level": "sub *",
  "parent": "parentCategoryId"
}
```

- `level` values: `gender` | `main` | `sub`
- `parent` is required when `level = sub`
- `parent` is forbidden when `level = main` or `level = gender`

**QA checks:**
- Deleting a category that has sub-categories should be blocked.

---

### 7.26 Admin — Collections

All endpoints require roles: `super-admin` or `inventory-management`.

#### Create / Update Collection

**Body:**
```json
{
  "title": "Summer Sale *",
  "slug": "summer-sale",
  "eyebrow": "string",
  "description": "string",
  "heroImage": { "url": "https://...", "alt": "string" },
  "tabs": [{ "label": "All", "slug": "all" }],
  "sortOptions": [],
  "promo": {
    "eyebrow": "string",
    "title": "string",
    "description": "string",
    "actions": [{ "label": "Shop Now", "slug": "/shop" }]
  },
  "productFilter": "sale",
  "isActive": true,
  "displayOrder": 1
}
```

- `productFilter` values: `men` | `women` | `sale` | `featured` | `all`

---

### 7.27 Admin — Orders

All endpoints require role: `super-admin`.

#### List Orders — `GET /api/admin/orders`

**Query params:** `page`, `limit`, `status`

#### Update Order Status — `PATCH /api/admin/orders/:id/status`

**Body:**
```json
{
  "status": "shipped",
  "trackingId": "TRK123456"
}
```

**Order status flow:**

```
pending → confirmed → shipped → out_for_delivery → delivered
                                                  └→ cancelled
                                                  └→ returned
```

---

### 7.28 Admin — Analytics

All endpoints require role: `super-admin`.

#### Overview — `GET /api/admin/analytics/overview`

**Expected success data shape:**
```json
{
  "totalUsers": 500,
  "totalProducts": 120,
  "totalOrders": 1500,
  "totalRevenue": 1850000
}
```
- `totalRevenue` counts only **paid** orders.

#### Revenue Chart — `GET /api/admin/analytics/revenue`

**Expected success data shape:**
```json
[
  { "date": "2026-04-27", "revenue": 15000, "orders": 12 },
  { "date": "2026-04-28", "revenue": 22000, "orders": 18 }
]
```
- Returns daily data for the **last 30 days**.
- Only paid orders are included in revenue.

#### Order Status Breakdown — `GET /api/admin/analytics/order-status-breakdown`

**Expected success data shape:**
```json
[
  { "status": "pending", "count": 150 },
  { "status": "delivered", "count": 900 }
]
```

#### Top Products — `GET /api/admin/analytics/top-products`

**Expected success data shape:**
```json
[
  {
    "productId": "string",
    "title": "Product Name",
    "totalSold": 250,
    "revenue": 324750
  }
]
```
- Returns top **10** products sorted by `totalSold` descending.

---

## 8) Key Data Shapes (Models)

### User
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "gender": "men | women | unisex",
  "role": "customer | super-admin | user-admin | inventory-management",
  "isVerified": true,
  "isBlocked": false,
  "avatar": "https://...",
  "lastLogin": "2026-05-27T10:00:00.000Z",
  "createdAt": "2026-05-27T10:00:00.000Z",
  "updatedAt": "2026-05-27T10:00:00.000Z",
  "deletedAt": null
}
```

### Product Variant
```json
{
  "sku": "SKU123",
  "price": 1299,
  "discount": { "type": "percentage | fixed", "value": 10 },
  "stock": 50,
  "size": "S | M | L | XL",
  "color": "Black",
  "colorCode": "#000000",
  "images": [{ "url": "https://...", "alt": "string" }]
}
```

### Order
```json
{
  "_id": "string",
  "user": "userId",
  "items": [
    {
      "product": "productId",
      "title": "string",
      "slug": "string",
      "variantSku": "SKU123",
      "size": "M",
      "color": "Black",
      "price": 1299,
      "discount": {},
      "finalPrice": 1169,
      "quantity": 1,
      "image": [{ "url": "https://...", "alt": "string" }]
    }
  ],
  "shippingAddress": {
    "fullName": "string",
    "phone": "string",
    "pincode": "string",
    "state": "string",
    "city": "string",
    "addressLine1": "string",
    "addressLine2": "string"
  },
  "payment": { "method": "cod | card | upi | netbanking", "status": "pending | paid | failed" },
  "orderStatus": "pending | confirmed | shipped | out_for_delivery | delivered | cancelled | returned",
  "totalItems": 1,
  "subtotal": 1299,
  "discountAmount": 130,
  "shippingCharges": 0,
  "totalAmount": 1169,
  "trackingId": "string",
  "createdAt": "2026-05-27T10:00:00.000Z"
}
```

---

## 9) Suggested Postman Collection Structure

```
├── Auth
│   ├── Signup
│   ├── Login
│   ├── Logout
│   ├── Me (current user)
│   ├── Verify Email
│   ├── Resend Verification
│   ├── Forgot Password
│   └── Reset Password
├── Products (Public)
│   ├── List Products
│   ├── List Products with filters
│   ├── List Products with pagination
│   ├── Get Product by Slug
│   └── Get Product by ID
├── Collections (Public)
│   ├── List Collections
│   └── Get Collection by Slug
├── Cart
│   ├── Get Cart
│   ├── Add Item
│   ├── Update Item Quantity
│   └── Remove Item
├── Wishlist
│   ├── Get Wishlist
│   ├── Add Item
│   └── Remove Item
├── Orders
│   ├── Order History
│   └── Checkout
├── Admin / Auth
│   ├── Admin Login
│   └── Admin Logout
├── Admin / Users
│   ├── List Users
│   ├── Get User
│   ├── Create User
│   ├── Update User
│   └── Delete User
├── Admin / Products
│   ├── List Products
│   ├── Get Product
│   ├── Create Product
│   ├── Update Product
│   ├── Delete Product (soft)
│   └── Restore Product
├── Admin / Brands
│   ├── List Brands
│   ├── Create Brand
│   ├── Update Brand
│   └── Delete Brand
├── Admin / Categories
│   ├── List Categories
│   ├── Create Category
│   ├── Update Category
│   └── Delete Category
├── Admin / Collections
│   ├── List Collections
│   ├── Get Collection
│   ├── Create Collection
│   ├── Update Collection
│   └── Delete Collection
├── Admin / Orders
│   ├── List Orders
│   ├── Get Order
│   └── Update Order Status
└── Admin / Analytics
    ├── Overview
    ├── Revenue Chart (last 30 days)
    ├── Order Status Breakdown
    └── Top Products
```

---

## 10) Regression Scenarios for QA

1. **Login → Me → Logout → Me** (second Me call should return auth failure)
2. **Signup with duplicate email** (should return failure, not 500)
3. **Add item to cart beyond stock limit** (should return failure)
4. **Checkout with out-of-stock item** (should block order)
5. **Product slug not found** (should return proper failure, not 500)
6. **Expired auth session while accessing protected route** (should return `AUTH_TOKEN_EXPIRED`)
7. **Admin login with customer role credentials** (should be rejected)
8. **Delete a category that has children** (should be blocked)
9. **Reset password with expired token** (should return failure)
10. **Free shipping threshold** — order with subtotal = ₹998 should have ₹49 shipping; ₹999 should have ₹0

---

## 11) Notes for Team Alignment

- Keep the response wrapper (`success + data` or `success + code + message`) consistent across all endpoints.
- Auth error codes must remain stable — clients depend on them for UX flows.
- Admin RBAC roles must not be changed without updating the role table in this document.
- Soft-deleted users and products are excluded from all public/customer endpoints by default.
- Rate-limiting applies to auth endpoints — tests should account for this in high-frequency scenarios.
