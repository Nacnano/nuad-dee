"use client";

import { useEffect, useState } from "react";
import { getFromLocalStorage, clearLocalStorage } from "@/utils/localStorage";
import { User } from "@/utils/mockData";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [storageData, setStorageData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const user = getFromLocalStorage("currentUser");
    setCurrentUser(user);

    if (user?.role !== "admin") {
      window.location.href = "/";
      return;
    }

    // Load all localStorage data
    updateStorageData();
  }, []);

  const updateStorageData = () => {
    const data: { [key: string]: any } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || "");
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    setStorageData(data);
  };

  const handleClearStorage = () => {
    if (
      window.confirm("Are you sure you want to clear all localStorage data?")
    ) {
      clearLocalStorage();
      updateStorageData();
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Admin Dashboard
        </h1>
        <button
          onClick={handleClearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear All Data
        </button>
      </div>

      {/* LocalStorage Data Display */}
      <div className="space-y-8">
        {Object.entries(storageData).map(([key, value]) => (
          <div key={key} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{key}</h2>
            <pre className="bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
