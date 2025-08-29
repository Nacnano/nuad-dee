"use client";

import { useEffect, useState } from "react";
import { getFromLocalStorage } from "@/utils/localStorage";
import { User } from "@/utils/mockData";

export default function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getFromLocalStorage("currentUser");
    setCurrentUser(user);
    setLoading(false);

    if (!user || !allowedRoles.includes(user.role)) {
      window.location.href = "/login";
    }
  }, [allowedRoles]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return null;
  }

  return children;
}
