"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const listingData = [
  { month: "Jan", listings: 90, revenue: 140000 },
  { month: "Feb", listings: 132, revenue: 205000 },
  { month: "Mar", listings: 188, revenue: 322000 },
  { month: "Apr", listings: 241, revenue: 411000 },
  { month: "May", listings: 210, revenue: 398000 },
];

const moderationData = [
  { week: "W1", approval: 81 },
  { week: "W2", approval: 84 },
  { week: "W3", approval: 88 },
  { week: "W4", approval: 86 },
];

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-700">Listings vs Revenue</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={listingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="listings" stroke="#0284c7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-700">Moderation Approval Rate</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moderationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="approval" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

