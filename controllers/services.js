const Contact = require("../models/contacts");

const fetchContacts = async () => {
  try {
    return await Contact.find();
  } catch (error) {
    throw new Error("Failed to fetch contacts: " + error.message);
  }
};

const fetchContactById = async (id) => {
  try {
    return await Contact.findById({ _id: id });
  } catch (error) {
    throw new Error("Failed to fetch contact by ID: " + error.message);
  }
};

const insertContact = async ({ name, email, phone, favorite }) => {
  try {
    return await Contact.create({ name, email, phone, favorite });
  } catch (error) {
    throw new Error("Failed to insert contact: " + error.message);
  }
};

const updateContact = async ({ id, toUpdate }) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: toUpdate },
      { new: true, runValidators: true, strict: "throw" }
      );
      
        if (!updatedContact) {
          throw new Error("Contact not found");
        }
    return updatedContact;
  } catch (error) {
    throw new Error("Update failed: " + error.message);
  }
};

const updateStatusContact = async ({ id, favorite }) => {
  try {
    return await Contact.findByIdAndUpdate(
      { _id: id },
      { favorite },
      { new: true }
    );
  } catch (error) {
    throw new Error("Failed to update contact status: " + error.message);
  }
};

const removeContact = async (id) => {
  try {
      const result = await Contact.deleteOne({ _id: id });
      return result;
  } catch (error) {
    throw new Error("Failed to remove contact: " + error.message);
  }
};

module.exports = {
  fetchContacts,
  fetchContactById,
  insertContact,
  updateContact,
  removeContact,
  updateStatusContact,
};
