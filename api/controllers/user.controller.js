import bcryptjs from "bcryptjs";

import { errorHandler } from "../libs/utils.js";
import User from "../models/user.model.js";

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to update this user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password too short"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length > 20) {
      return next(errorHandler(400, "Username is too long"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(errorHandler(400, "Username cannot contain special characters"));
    }
  }
  if (req.body.username === "" || req.body.email === "") {
    return next(errorHandler(400, "Fields cannot be updated when it is empty"));
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          image: req.body.image,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...userData } = updatedUser._doc;
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token").status(200).json("User has been signed out");
  } catch (error) {
    next(error);
  }
};
