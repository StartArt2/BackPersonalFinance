require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas públicas (auth)
app.use("/api/auth", authRoutes);

// Middleware de autenticación para todo lo demás
app.use(authenticate);

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Conectado a MongoDB"))
.catch(err => console.error("❌ Error conectando a MongoDB:", err));

// Rutas base (ejemplo)
app.get("/", (req, res) => {
  res.send("API de Finanzas funcionando 🚀");
});

// Swagger
const { swaggerUi, swaggerSpec } = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Rutas protegidas
const abonoRoutes = require("./routes/abono.routes");
const compraRoutes = require("./routes/compra.routes");
const deudaRoutes = require("./routes/deuda.routes");
const gastoFijoRoutes = require("./routes/gastoFijo.routes");
const gastoVariableRoutes = require("./routes/gastoVariable.routes");
const cajaRoutes = require("./routes/caja.routes");

app.use("/api/abonos", abonoRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/deudas", deudaRoutes);
app.use("/api/gastos-fijos", gastoFijoRoutes);
app.use("/api/gastos-variables", gastoVariableRoutes);
app.use("/api/cajas", cajaRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});