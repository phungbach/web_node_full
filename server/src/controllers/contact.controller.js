const seedContacts = [];

export const createContact = async (req, res, next) => {
  try {
    const contact = {
      _id: String(Date.now()),
      name: req.body.name,
      phone: req.body.phone,
      message: req.body.message || '',
      status: 'new',
      createdAt: new Date(),
    };

    seedContacts.unshift(contact);

    res.status(201).json({ success: true, message: 'Contact created', data: contact });
  } catch (error) {
    next(error);
  }
};

export const listContacts = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Success', data: seedContacts });
  } catch (error) {
    next(error);
  }
};
