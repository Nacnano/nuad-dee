"use client";

import { mockImpactStats } from "@/utils/mockData";

export default function ImpactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Our Social Impact
      </h1>

      {/* Key Statistics */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {mockImpactStats.jobsCreated}
            </div>
            <div className="text-gray-600">Jobs Created</div>
            <div className="mt-4 text-sm text-gray-500">
              Direct employment opportunities for visually impaired individuals
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {mockImpactStats.activeTherapists}
            </div>
            <div className="text-gray-600">Active Therapists</div>
            <div className="mt-4 text-sm text-gray-500">
              Skilled professionals providing services across Thailand
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {mockImpactStats.partnersJoined}
            </div>
            <div className="text-gray-600">Partner Organizations</div>
            <div className="mt-4 text-sm text-gray-500">
              Companies committed to inclusive employment
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {mockImpactStats.customersServed.toLocaleString()}
            </div>
            <div className="text-gray-600">Customers Served</div>
            <div className="mt-4 text-sm text-gray-500">
              Satisfied clients experiencing our quality services
            </div>
          </div>
        </div>
      </section>

      {/* Progress Towards Goal */}
      <section className="mb-16">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Progress Towards Our Goal
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600">
                {Math.round(
                  (mockImpactStats.jobsCreated / mockImpactStats.goalJobs) * 100
                )}
                %
              </div>
              <div className="text-gray-600 mt-2">
                Progress to {mockImpactStats.goalJobs.toLocaleString()} jobs by{" "}
                {mockImpactStats.targetYear}
              </div>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-6 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{
                    width: `${
                      (mockImpactStats.jobsCreated / mockImpactStats.goalJobs) *
                      100
                    }%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Benefits Section */}
      <section className="mb-16">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Legal Benefits for Partner Companies
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tax Benefits Under Thai Law (พ.ร.บ. 2550)
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  Double deduction of expenses for employing persons with
                  disabilities
                </li>
                <li>
                  Tax deduction for facility modification costs to accommodate
                  employees with disabilities
                </li>
                <li>
                  Additional incentives for businesses exceeding the required
                  ratio of employees with disabilities
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Compliance Benefits
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  Meet legal requirements for employing persons with
                  disabilities
                </li>
                <li>Contribute to corporate social responsibility goals</li>
                <li>
                  Enhance company reputation through inclusive employment
                  practices
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Success Stories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              "From Training to Financial Independence"
            </div>
            <p className="text-gray-600 mb-4">
              After completing our training program, Somchai now earns a stable
              income as a professional massage therapist, supporting his family
              and inspiring others in the visually impaired community.
            </p>
            <div className="text-sm text-gray-500">
              - Somchai P., Graduate 2024
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              "Corporate Partnership Success"
            </div>
            <p className="text-gray-600 mb-4">
              By partnering with NuadDee, our company not only fulfilled its
              social responsibility but also gained access to skilled
              professionals who consistently receive high customer satisfaction
              ratings.
            </p>
            <div className="text-sm text-gray-500">
              - HR Director, Leading Hotel Chain
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
