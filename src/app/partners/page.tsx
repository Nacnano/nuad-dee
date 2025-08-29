"use client";

import { useState } from "react";
import { mockPartners } from "@/utils/mockData";
import { setToLocalStorage, getFromLocalStorage } from "@/utils/localStorage";

export default function PartnersPage() {
  const [formData, setFormData] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const application = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    const existingApplications =
      getFromLocalStorage("partner_applications") || [];
    setToLocalStorage("partner_applications", [
      ...existingApplications,
      application,
    ]);

    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Partner with NuadDee
      </h1>

      {/* Current Partners Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Our Current Partners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white shadow rounded-lg p-6 flex flex-col items-center"
            >
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400">Logo</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {partner.name}
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {partner.description}
              </p>
              <p className="text-sm text-gray-400">
                Partner since{" "}
                {new Date(partner.joinedDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership Benefits Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Benefits of Partnership
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Social Impact
            </h3>
            <p className="text-blue-700">
              Make a meaningful difference in the lives of visually impaired
              individuals by providing employment opportunities.
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-900 mb-4">
              Tax Benefits
            </h3>
            <p className="text-green-700">
              Receive tax deductions according to Thai law (พ.ร.บ. 2550) for
              employing persons with disabilities.
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-purple-900 mb-4">
              Brand Recognition
            </h3>
            <p className="text-purple-700">
              Be recognized as a socially responsible organization committed to
              inclusivity and diversity.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Application Form */}
      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Apply to Become a Partner
        </h2>

        {submitted ? (
          <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h3 className="font-bold mb-2">
              Application Submitted Successfully!
            </h3>
            <p>
              Thank you for your interest in partnering with us. We will review
              your application and contact you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                name="organizationName"
                required
                value={formData.organizationName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                required
                value={formData.contactPerson}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Application
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
