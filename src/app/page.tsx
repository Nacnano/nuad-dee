"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mockImpactStats } from "@/utils/mockData";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 mix-blend-multiply" />
        </div>
        <div
          className={`relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Empowering{" "}
            <span className="block text-blue-200">
              Visually Impaired Masseurs
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-blue-100">
            Join our platform that connects skilled masseurs with customers
            while providing comprehensive training and meaningful employment
            opportunities for the visually impaired community.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:text-lg"
            >
              Book a Massage
            </Link>
            <Link
              href="/training"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 md:text-lg"
            >
              Join Training Program
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose NuadDee?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experience the perfect blend of professional service and social
              impact
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-2xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Professional Quality
              </h3>
              <p className="text-gray-600">
                Our therapists are highly trained and certified, ensuring
                top-quality massage services.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-2xl mb-4">💪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Empowerment
              </h3>
              <p className="text-gray-600">
                Support meaningful employment opportunities for the visually
                impaired community.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-blue-600 text-2xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Social Impact
              </h3>
              <p className="text-gray-600">
                Make a difference while receiving excellent service. Win-win for
                everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Impact
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Together, we're creating positive change in our community
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {mockImpactStats.jobsCreated}
              </div>
              <div className="mt-2 text-sm text-gray-600">Jobs Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {mockImpactStats.activeTherapists}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Active Therapists
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {mockImpactStats.partnersJoined}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Partner Organizations
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {mockImpactStats.customersServed.toLocaleString()}
              </div>
              <div className="mt-2 text-sm text-gray-600">Customers Served</div>
            </div>
          </div>

          <div className="mt-12">
            <div className="bg-blue-50 rounded-lg p-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Progress Towards Our Goal
                </h3>
                <p className="text-gray-600">
                  Target: {mockImpactStats.goalJobs.toLocaleString()} jobs by{" "}
                  {mockImpactStats.targetYear}
                </p>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-blue-100">
                  <div
                    style={{
                      width: `${
                        (mockImpactStats.jobsCreated /
                          mockImpactStats.goalJobs) *
                        100
                      }%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block text-blue-200">Join our mission today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/partners"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Become a Partner
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/training"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Training
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              What Our Community Says
            </h2>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-600 mb-4">
                "NuadDee has given me the opportunity to build a meaningful
                career and support my family. The training program was
                excellent."
              </p>
              <div className="font-medium text-gray-900">Somchai P.</div>
              <div className="text-gray-500">Certified Therapist</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-600 mb-4">
                "The quality of service is outstanding. It's wonderful to know
                that my massage session also supports such a meaningful cause."
              </p>
              <div className="font-medium text-gray-900">Jane D.</div>
              <div className="text-gray-500">Regular Customer</div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-600 mb-4">
                "Partnering with NuadDee has helped us meet our social
                responsibility goals while providing excellent wellness services
                for our staff."
              </p>
              <div className="font-medium text-gray-900">Sarah M.</div>
              <div className="text-gray-500">Corporate Partner</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
