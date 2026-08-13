const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const companies = await prisma.company.findMany();

        res.json(companies);
    } catch (error) {
        console.error("Error al obtener empresas:", error);

        res.status(500).json({
            message: "Error al obtener las empresas"
        });
    }
});

module.exports = router;