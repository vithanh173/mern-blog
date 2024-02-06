import bcryptjs from "bcryptjs";

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
