import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const buildSwaggerSpec = () =>
  swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Fasco Backend API',
        version: '1.0.0',
        description: 'API docs for Fasco backend services',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 5000}`,
          description: 'Local server',
        },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'token',
          },
        },
        schemas: {
          ProductVariant: {
            type: 'object',
            required: ['sku', 'price', 'stock'],
            properties: {
              sku:      { type: 'string', description: 'Stock-keeping unit identifier' },
              price:    { type: 'number', minimum: 0, description: 'Selling price' },
              discount: { type: 'number', minimum: 0, default: 0, description: 'Discount amount' },
              stock:    { type: 'number', minimum: 0, description: 'Available stock quantity' },
              size:     { type: 'string', description: 'Size label (optional)' },
              color:    { type: 'string', description: 'Color name (optional)' },
              colorCode:{ type: 'string', description: 'CSS hex color (optional)' },
              images:   { type: 'array', items: { type: 'string' }, description: 'Image URLs (optional)' },
            },
          },
        },
      },
    },
    apis: ['./routes/**/*.ts', './controller/**/*.ts'],
  });

const setupSwagger = (app: Express) => {
  const spec = buildSwaggerSpec();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/api-docs.json', (_req, res) => res.json(spec));
};

export default setupSwagger;
