# Product Service

A comprehensive microservice for managing products and categories in the SaharaSprout agricultural platform.

## Features

- **Product Management**: CRUD operations for agricultural products
- **Category Management**: Hierarchical category system with subcategories
- **Image Handling**: Support for multiple product images
- **Search & Filtering**: Full-text search with Elasticsearch integration
- **Inventory Tracking**: Stock management with movement history
- **Caching**: Redis-based caching for improved performance
- **Authentication**: JWT-based authentication with role-based access
- **Validation**: Comprehensive input validation and sanitization
- **Health Checks**: Kubernetes-ready health and readiness probes

## API Endpoints

### Products

- `GET /api/products` - Get all products with pagination and filters
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product (farmers only)
- `PUT /api/products/:id` - Update a product (farmers only)
- `DELETE /api/products/:id` - Delete a product (farmers only)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products
- `PATCH /api/products/:id/stock` - Update product stock
- `GET /api/products/farmer/:farmerId` - Get products by farmer
- `GET /api/products/my/products` - Get own products (authenticated)

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:identifier` - Get category by ID or slug
- `POST /api/categories` - Create a category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)
- `GET /api/categories/hierarchy` - Get category hierarchy tree
- `GET /api/categories/:id/subcategories` - Get subcategories
- `GET /api/categories/:id/breadcrumbs` - Get category breadcrumbs
- `GET /api/categories/popular` - Get popular categories

### Health

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with dependencies
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /health/metrics` - Basic metrics

## Environment Variables

```env
NODE_ENV=development
PORT=3011
SERVICE_NAME=product-service

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=saharasprout_products
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# File Upload
UPLOAD_DIR=uploads/products
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp

# Elasticsearch (optional)
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up the database:
```bash
# Make sure PostgreSQL is running on port 5433
# The service will automatically create tables on startup
```

4. Start the service:
```bash
# Development
npm run dev

# Production
npm start
```

## Docker Support

Build and run with Docker:

```bash
# Build image
docker build -t saharasprout-product-service .

# Run container
docker run -p 3011:3011 --env-file .env saharasprout-product-service
```

## Database Schema

### Products Table
- Comprehensive product information
- Full-text search capabilities
- Stock tracking
- Rating system
- Tag support

### Categories Table
- Hierarchical structure with parent-child relationships
- Slug-based URLs
- Active/inactive status
- Sort ordering

### Product Images Table
- Multiple images per product
- Primary image designation
- Alt text for accessibility

### Product Variants Table
- Different sizes, qualities, or variations
- Individual pricing and stock
- Attribute-based customization

### Product Reviews Table
- User ratings and comments
- Verified purchase tracking
- Approval workflow

### Inventory Movements Table
- Complete audit trail
- Movement types (IN, OUT, ADJUSTMENT, etc.)
- Reference tracking

## Authentication & Authorization

- **JWT Tokens**: Stateless authentication
- **Role-Based Access**: Different permissions for buyers, farmers, and admins
- **Resource Ownership**: Farmers can only modify their own products
- **Admin Privileges**: Full access to all resources

## Caching Strategy

- **Product Lists**: Cached for 5 minutes
- **Individual Products**: Cached for 10 minutes
- **Categories**: Cached for 10-20 minutes
- **Search Results**: Cached for 2 minutes
- **Cache Invalidation**: Automatic on data updates

## Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Full-Text Search**: PostgreSQL tsvector for fast search
- **Image Optimization**: Sharp.js for image processing
- **Compression**: gzip compression for responses
- **Rate Limiting**: Protection against abuse

## Error Handling

- **Validation Errors**: Detailed field-level validation
- **Database Errors**: Proper error mapping and user-friendly messages
- **Authentication Errors**: Clear JWT error handling
- **Not Found Errors**: Consistent 404 responses
- **Server Errors**: Logged with correlation IDs

## Logging

- **Structured Logging**: JSON format with Winston
- **Request Logging**: All HTTP requests with response times
- **Error Logging**: Complete stack traces in development
- **Daily Rotation**: Automatic log file rotation
- **Log Levels**: Configurable log levels by environment

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Documentation

The service provides OpenAPI/Swagger documentation at:
- `http://localhost:3011/api-docs` (when running)

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details
