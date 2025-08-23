const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Finanzas Personales",
      version: "1.0.0",
      description: "API para manejar gastos, compras, deudas y caja.",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
      },
    ],
  },
  // Aquí se buscarán las anotaciones de tus rutas
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
