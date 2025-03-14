import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { v4 as uuidv4 } from "uuid";
import cookie from "cookie";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "POST") {
        try {
            let sessionId = req.cookies.sessionId;

            if (!sessionId) {
                sessionId = uuidv4();
                res.setHeader(
                    "Set-Cookie",
                    cookie.serialize("sessionId", sessionId, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                        maxAge: 60 * 60 * 24 * 7,
                        path: "/",
                    })
                );
            }

            const orderData = { ...req.body, sessionId, status: "pending" };
            const newOrder = await Order.create(orderData);
            return res.status(201).json({ success: true, order: newOrder });
        } catch (error) {
            console.error("Error placing order:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }

    return res.status(405).json({ message: "Method not allowed" });
}
