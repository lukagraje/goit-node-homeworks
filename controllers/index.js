const Joi = require("joi");

const {
  fetchContacts,
  fetchContactById,
  insertContact,
  updateContact,
  removeContact,
  updateStatusContact,
} = require("./services");

const addContactSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .min(3)
    .max(20)
    .required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  phone: Joi.string()
    .pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
    .required(),
  favorite: Joi.boolean().required(),
});

const updateContactSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .min(3)
    .max(20)
    .optional(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  phone: Joi.string()
    .pattern(/^\(\d{3}\) \d{3}-\d{4}$/)
    .optional(),
  favorite: Joi.boolean().optional(),
});

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await fetchContacts();
    res.status(200).json(contacts);
  } catch (e) {
    next(e);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await fetchContactById(req.params.id);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  const { name, email, phone, favorite } = req.body;
  try {
    const { error } = addContactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const result = await insertContact({ name, email, phone, favorite });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const putContact = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { error } = updateContactSchema.validate(req.body);
    if (error) {
      const errorMessages = error.details.map((err) => err.message);
      res.status(400).json({ message: errorMessages });
    }

    const result = await updateContact({ id, toUpdate: req.body });
    if (!result) {
      res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await removeContact(id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(204).json({ message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
};

const patchContact = async (req, res, next) => {
  const { id } = req.params;
  const { favorite } = req.body;
  try {
    if (!favorite) {
      return res.status(400).json({ message: "Missing field favorite" });
    }
    const result = await updateStatusContact({ id, favorite });
    if (!result) {
      res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  putContact,
  deleteContact,
  patchContact,
};
