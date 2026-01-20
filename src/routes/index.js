import { Router } from "express";
import * as BotController from "../controllers/BotController.js";

const router = Router();

router.get("/", BotController.index);
router.get("/bots/add", BotController.create);
router.post("/bots/add", BotController.store);
router.get("/bots/:sessionId", BotController.show);
router.post("/bots/join", BotController.joinGroup);
router.delete("/bots/:sessionId", BotController.destroy);


export default router;
