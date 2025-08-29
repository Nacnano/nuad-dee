"use client";

import { useState, useEffect } from "react";
import { mockTherapists, Therapist, User } from "@/utils/mockData";
import { getFromLocalStorage, setToLocalStorage } from "@/utils/localStorage";

export default function BookingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(
    null
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [service, setService] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const user = getFromLocalStorage("currentUser");
    setCurrentUser(user);
  }, []);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedTherapist) return;

    const booking = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: currentUser.id,
      therapistId: selectedTherapist.id,
      date,
      time,
      service,
      status: "pending",
      price: selectedTherapist.price,
    };

    const existingBookings = getFromLocalStorage("bookings") || [];
    setToLocalStorage("bookings", [...existingBookings, booking]);
    setBookingSuccess(true);
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
          <p>
            Your booking has been successfully created. You will receive a
            confirmation email shortly.
          </p>
          <button
            onClick={() => (window.location.href = "/booking")}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Book Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Book a Massage
      </h1>

      {/* Therapist List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockTherapists.map((therapist) => (
          <div
            key={therapist.id}
            className={`border rounded-lg p-6 cursor-pointer ${
              selectedTherapist?.id === therapist.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => setSelectedTherapist(therapist)}
          >
            <h3 className="text-lg font-semibold mb-2">
              Therapist {therapist.id}
            </h3>
            <p className="text-gray-600 mb-2">Location: {therapist.location}</p>
            <p className="text-gray-600 mb-2">
              Skills: {therapist.skills.join(", ")}
            </p>
            <p className="text-gray-600 mb-2">Price: ฿{therapist.price}/hr</p>
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1">{therapist.rating}</span>
              <span className="ml-2 text-gray-500">
                ({therapist.reviews} reviews)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Form */}
      {selectedTherapist && (
        <form onSubmit={handleBooking} className="max-w-lg mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <select
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select a time</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service
              </label>
              <select
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select a service</option>
                {selectedTherapist.skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            {!currentUser ? (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                Please{" "}
                <a href="/login" className="underline">
                  login
                </a>{" "}
                to complete your booking.
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Book Now
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
