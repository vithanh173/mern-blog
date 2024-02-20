import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { errorHandler } from "../libs/utils.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password || username === "" || email === "" || password === "") {
    next(errorHandler(400, "All fields are required"));
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    next(errorHandler(401, "Email already in use"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });
  try {
    await newUser.save();
    res.json("User created successfully!");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "User not found!"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Wrong credentials!"));
    }
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: pass, ...data } = validUser._doc;

    res.status(200).cookie("access_token", token, { httpOnly: true }).json(data);
  } catch (error) {}
};

export const google = async (req, res, next) => {
  const { email, name, photoUrl } = req.body;
  try {
    const existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser._id, isAdmin: existingUser.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      const { password, ...data } = existingUser._doc;
      res.status(200).cookie("access_token", token, { httpOnly: true }).json(data);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: name.split(" ").join("") + Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        image: photoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      const { password, ...data } = newUser._doc;
      res.status(200).cookie("access_token", token, { httpOnly: true }).json(data);
    }
  } catch (error) {}
};
