import express from "express";

import {
  createContact,
  deleteContact,
  getContacts,
  markContactAsRead,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/createContact", createContact);
router.get("/fetchAllContacts", getContacts);
router.put("/contact/:id/read", markContactAsRead);
router.delete("/deleteContact/:id", deleteContact);

export default router;
