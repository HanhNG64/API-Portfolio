const bcrypt = require('bcrypt');
const User = require('../models/user');

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

exports.getAllUsers = async (req, res, next) => {
  try {
    let users = await User.find();
    return res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    let userId = req.params.id;
    if (!userId) {
      throw new RequestError('Missing parameter');
    }

    let user = await User.findById(userId);
    if (user === null) {
      throw new UserError('This user does not exist !', 404);
    }

    return res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    let userId = req.params.id;
    if (!userId) {
      throw new RequestError('Missing parameter');
    }

    let user = await User.findById(userId);
    if (user === null) {
      throw new UserError('This user does not exist !', 404);
    }
    let hash = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT_ROUND));
    req.body.password = hash;
    await User.updateOne({ _id: userId }, { ...req.body, _id: userId });

    return res.status(200).json({ message: 'User updated' });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    let userId = req.params.id;
    if (!userId) {
      throw new RequestError('Missing parameter');
    }

    let user = User.findById(userId);
    if (user === null) {
      throw new UserError('This user does not exist !', 404);
    }
    await User.deleteOne({ _id: userId });

    return res.status(204).json();
  } catch (error) {
    next(error);
  }
};
