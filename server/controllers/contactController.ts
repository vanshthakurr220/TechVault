import { Request, Response } from "express";
import { Contact } from "../models/Contact.js";

// ===============================
// 📩 CREATE CONTACT MESSAGE
// ===============================
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      message,
      isRead: false, // default
    });

    res.status(201).json({
      message: "Message sent successfully",
      contact,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ===============================
// 📖 GET ALL CONTACTS
// ===============================
export const getContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Contacts fetched successfully",
      contacts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ===============================
// 🟢 MARK CONTACT AS READ
// ===============================
export const markContactAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.status(200).json({
      message: "Contact marked as read",
      contact: updatedContact,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ===============================
// 🗑️ DELETE CONTACT
// ===============================
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }

    res.status(200).json({
      message: "Contact deleted successfully",
      contact: deletedContact,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
