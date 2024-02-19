import express from "express";

import { deleteUser, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../libs/utils.js";

const router = express.Router();

router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);

export default router;
