"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map