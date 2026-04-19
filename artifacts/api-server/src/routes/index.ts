import { Router, type IRouter } from "express";
import healthRouter from "./health";
import promptsRouter from "./prompts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(promptsRouter);

export default router;
