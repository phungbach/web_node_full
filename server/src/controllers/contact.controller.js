import { createContactRecord, getContactRecords } from '../services/contact.service.js';

export const createContact = async (req, res, next) => {
  try {
    const contact = await createContactRecord({
      name: req.body.name,
      phone: req.body.phone,
      message: req.body.message || '',
    });
    res.status(201).json({ success: true, message: 'Contact created', data: contact });
  } catch (error) {
    next(error);
  }
};

export const listContacts = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Success', data: await getContactRecords() });
  } catch (error) {
    next(error);
  }
};
