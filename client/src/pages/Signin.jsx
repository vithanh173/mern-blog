import { Alert, Button, Label, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Zoom, toast } from "react-toastify";

import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import "react-toastify/dist/ReactToastify.css";

const SigninFormSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password is required" })
    .transform((value) => value.replace(/\s+/g, "")),
});

export default function Signin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { error: errorMessage } = useSelector((state) => state.user);

  const {
    register,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(SigninFormSchema),
  });

  const onSubmit = async (formData) => {
    dispatch(signInStart());
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        dispatch(signInSuccess(data));
        toast.success("Login successfully", {
          position: "top-center",
          autoClose: 3000,
          draggable: true,
          transition: Zoom,
        });
        navigate("/");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex flex-col md:flex-row md:items-center p-3 max-w-3xl mx-auto gap-5">
        <div className="flex-1">
          <Link to={"/"} className="font-bold text-4xl dark:text-white">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-lg text-white">
              My Blog
            </span>
          </Link>
          <p className="text-sm mt-5">
            This is a demo project. You can sign up with your email and password or with Google.
          </p>
        </div>
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="">
              <Label value="Your email" />
              <TextInput type="email" placeholder="Email" id="email" {...register("email")} />
              {errors.email && <span className="text-rose-600">{errors.email.message}</span>}
            </div>
            <div className="">
              <Label value="Your password" />
              <TextInput
                type="password"
                placeholder="******"
                id="password"
                {...register("password")}
              />
              {errors.password && <span className="text-rose-600">{errors.password.message}</span>}
            </div>
            <Button type="submit" disabled={isSubmitting} gradientDuoTone="purpleToPink">
              Sign In
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-lg mt-5">
            <span>Don't have an account?</span>
            <Link to={"/sign-up"} className="text-blue-600">
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
