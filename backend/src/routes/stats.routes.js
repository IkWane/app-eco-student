import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getByCategory, getMonthly } from "../controllers/stats.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/monthly", getMonthly);
router.get("/by-category", getByCategory);

export default router;
