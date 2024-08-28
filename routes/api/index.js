// const express = require("express");

// const router = express.Router();
// const {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// } = require("../../models/contacts.js");

// const Joi = require("joi");



// router.get("/", async (_req, res, next) => {
//   try {
//     const contacts = await listContacts();
//     if (contacts) {
//       res.status(200).json(contacts);
//     } else {
//       res.status(404).json({ message: "Not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// router.get("/:id", async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const contact = await getContactById(id);
//     if (contact) {
//       res.status(200).json(contact);
//     } else {
//       res.status(404).json({ message: "Not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// router.post("/", async (req, res, next) => {
//   const { error } = addContactSchema.validate(req.body);
//   if (error) {
//     const errorMessages = error.details.map((err) => err.message);
//     return res.status(400).json({ message: errorMessages });
//   }
//   try {
//     const { name, email, phone } = req.body;
//     const newContact = await addContact(name, email, phone);
//     res.status(201).json(newContact);
//   } catch (error) {
//     next(error);
//   }
// });

// router.delete("/:id", async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const updatedContacts = await removeContact(id);
//     if (updatedContacts) {
//       res.status(200).json({ message: "Contact deleted" });
//     } else {
//       res.status(404).json({ message: "Not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

// router.put("/:id", async (req, res, next) => {
//   const { id } = req.params;
//   const { error } = updateContactSchema.validate(req.body);
//   if (error) {
//     const errorMessages = error.details.map((err) => err.message);
//     res.status(400).json({ message: errorMessages });
//   }
//   try {
//     const updatedContact = await updateContact(id, req.body);
//     if (updatedContact) {
//       res.status(200).json(updatedContact);
//     } else {
//       res.status(404).json({ message: "Not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

//     // module.exports = router;


const express = require("express");
const router = express.Router();

const {
  getAllContacts,
  getContactById,
  createContact,
  putContact,
  deleteContact,
  patchContact,
} = require("../../controllers/index");

router.get("/", getAllContacts);
router.get("/:id", getContactById);
router.post("/", createContact);
router.put("/:id", putContact);
router.delete("/:id", deleteContact);
router.patch("/:id/favorite", patchContact);
module.exports = router;
