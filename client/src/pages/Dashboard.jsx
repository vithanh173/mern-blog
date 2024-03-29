import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import DashboardSidebar from "../components/DashboardSidebar";
import DashboardProfile from "../components/DashboardProfile";
import DashboardPosts from "../components/DashboardPosts";
import DashboardUsers from "../components/DashboardUsers";
import DashboardComments from "../components/DashboardComments";
import DashboardOverview from "../components/DashboardOverview";

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParmas = new URLSearchParams(location.search);
    const tabFromUrl = urlParmas.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/*Sidebar*/}
        <DashboardSidebar />
      </div>
      {/*Profile*/}
      {tab === "profile" && <DashboardProfile />}
      {tab === "posts" && <DashboardPosts />}
      {tab === "users" && <DashboardUsers />}
      {tab === "comments" && <DashboardComments />}
      {tab === "dashboard" && <DashboardOverview />}
    </div>
  );
}
