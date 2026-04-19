// src/app.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { neon } from "@neondatabase/serverless";
import axios from "axios";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
const sql = neon(process.env.DATABASE_URL);
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL не знайдено!");
    process.exit(1);
}
app.post("/api/orders", async (req, res) => {
    try {
        const { customerName, phone, address, items, total } = req.body;
        const today = new Date();
        const dateStr = today.getFullYear().toString().slice(2) +
            String(today.getMonth() + 1).padStart(2, '0') +
            String(today.getDate()).padStart(2, '0');
        const result = await sql `
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at::date = CURRENT_DATE
    `;
        const countToday = parseInt(result[0]?.count || '0') + 1;
        const orderNumber = String(countToday).padStart(3, '0');
        const orderId = `ORD-${dateStr}${orderNumber}`;
        await sql `
      INSERT INTO orders 
        (order_id, customer_name, phone, address, items, total)
      VALUES 
        (${orderId}, ${customerName}, ${phone}, ${address}, ${JSON.stringify(items)}::jsonb, ${total})
    `;
        if (TELEGRAM_TOKEN && CHAT_ID) {
            const message = `
🛒 *Нове замовлення!*

*Номер:* ${orderId}
*Ім'я:* ${customerName}
*Телефон:* ${phone}
*Адреса:* ${address}
*Сума:* ${total} ₴

*Товари:*
${items.map((item) => `• ${item.quantity} шт × Паска`).join('\n')}
      `.trim();
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "Markdown"
            });
        }
        console.log(`✅ Замовлення збережено: ${orderId}`);
        res.status(200).json({ message: "Замовлення прийнято!", orderId });
    }
    catch (error) {
        console.error("Помилка збереження:", error);
        res.status(500).json({ message: "Не вдалося зберегти замовлення" });
    }
});
app.get("/api/orders", async (req, res) => {
    try {
        const orders = await sql `SELECT * FROM orders ORDER BY created_at DESC`;
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Помилка отримання замовлень" });
    }
});
app.get("/", (req, res) => {
    res.json({ message: "✅ Server + Neon + Telegram Bot працює" });
});
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map