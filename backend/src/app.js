const express = require("express");
const cors = require("cors");

const companyRoutes = require("./routes/company.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({
        message: "API de Nexora funcionando correctamente"
    });
});

app.use("/api/companies", companyRoutes);

module.exports = app;