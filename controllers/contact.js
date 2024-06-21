const nodemailer = require('nodemailer');
const fs = require('fs');
const { format } = require('date-fns');
const { RequestError, ProjectError } = require('../errors/customError');
const Contact = require('../models/contact');
const ContactTemplate = require('../emails/contact.template');
const ReplyTemplate = require('../emails/reply.template');

const mailTrasporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.EMAIL_PWD,
  },
});

const contactMessage = async (name, email, message) => {
  const mailContent = {
    from: process.env.SENDER_EMAIL,
    replyTo: `${name} <${email}>`,
    to: process.env.SENDER_EMAIL,
    subject: `Prise de contact de ${name} (<${email}>)`,
    html: ContactTemplate(name, message),
  };

  await mailTrasporter.sendMail(mailContent, message);
};

const sendAutoReply = async (name, toMail, message) => {
  const mailContent = {
    from: 'Hanh NGUYEN<process.env.SENDER_EMAIL>',
    to: process.env.ENVIRONNEMENT === 'prod' ? toMail : process.env.EMAIL_USER_TOREPLY,
    subject: "Merci de m'avoir contactée",
    html: ReplyTemplate(name, message),
  };

  await mailTrasporter.sendMail(mailContent);
};

exports.addContact = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      throw new RequestError('Missing Data');
    }

    await contactMessage(name, email, message);
    await sendAutoReply(name, email, message);

    let contact = await Contact.findOne({ emailContact: email });
    if (contact === null) {
      const newContact = new Contact({
        name: name,
        emailContact: email,
      });

      await newContact.save();
    }

    return res.status(201).json({ message: `The contact ${email} created` });
  } catch (error) {
    next(error);
  }
};

exports.getAllContacts = (req, res, next) => {
  Contact.find()
    .then((contacts) => {
      res.json({ data: contacts });
    })
    .catch((error) => next(error));
};

exports.getContactsToAnswer = async (req, res, next) => {
  try {
    let contacts = await Contact.find({ toAnswer: 'true' });
    res.json({ data: contacts });
  } catch (error) {
    next(error);
  }
};

exports.getContact = async (req, res, next) => {
  try {
    let email = req.body.emailContact;
    if (!email) {
      throw new RequestError('Missing data');
    }

    let contact = await Contact.findOne({ emailContact: email });
    if (contact === null) {
      throw new ProjectError('This contact does not exist');
    }

    return res.json({ data: contact });
  } catch (error) {
    next(error);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    let contactId = req.params.id;
    if (!contactId) {
      throw new RequestError('Missing parameter');
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw new ProjectError('This contact does not exist !', 404);
    }

    await Contact.deleteOne({ _id: contactId });
    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};
