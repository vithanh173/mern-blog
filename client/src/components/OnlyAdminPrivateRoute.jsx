import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const OnlyAdminPrivateRoute = () => {
  const { user } = useSelector((state) => state.user);
  return user.currentUser && user.currentUser.isAdmin ? <Outlet /> : <Navigate to={"/sign-in"} />;
};

export default OnlyAdminPrivateRoute;
