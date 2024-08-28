// const fs = require("node:fs").promises;
// const { nanoid } = require("nanoid");

// const path = require("node:path");
// const contactsPath = path.join(__dirname, "contacts.json");


// async function listContacts() {
//   const file = await fs.readFile(path.resolve(contactsPath));
//   const contacts = JSON.parse(file);
//   return contacts;
// }

// async function getContactById(contactId) {
//   const contacts = await listContacts();
//   return contacts.find((contact) => contact.id === contactId);
// }

// async function removeContact(contactId) {
//   const contacts = await listContacts();
//   const index = contacts.findIndex((contact) => contact.id === contactId);

//   if (index === -1) {
//     return null;
//   }

//   const [removedContact] = contacts.splice(index, 1);
//   await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
//   return removedContact;
// }

// async function addContact(name, email, phone) {
//   const contacts = await listContacts();
//   const newContact = {
//     id: nanoid(21),
//     name,
//     email,
//     phone,
//   };
//   contacts.push(newContact);
//   await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
//   return newContact;
// }

// async function updateContact(contactId, body) {
//   const contacts = await listContacts();
//   const index = contacts.findIndex((contact) => contact.id === contactId);

//   if (index === -1) {
//     return null;
//   }

//   contacts[index] = { ...contacts[index], ...body };
//   await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
//   return contacts[index];
// }

// module.exports = {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
//   updateContact,
// };


const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema, "contacts");

module.exports = Contact;
