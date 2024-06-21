const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new RequestError('Missing parameter');
    }

    let user = await User.findOne({ email: email });
    if (user !== null) {
      throw new UserError(`The user ${name} already exists !`, 409);
    }

    let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND));
    const newUser = new User({
      name: name,
      email: email,
      password: hash,
    });
    await newUser.save();
    return res.status(201).json({ message: `The user ${name} created` });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AuthenticationError('Missing Data', 400);
    }

    let user = await User.findOne({ email: email });
    if (user === null) {
      throw new AuthenticationError('This account does not exists !', 404);
    }

    let valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Wrong password', 401);
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_DURING },
    );

    return res.status(200).json({ userId: user._id, token: token });
  } catch (error) {
    next(error);
  }
};
