import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import "./index.css";

const page = (f) => lazy(f);
const Home = page(() => import("./pages/Home"));
const TrackPage = page(() => import("./TrackPage"));
const Services = page(() => import("./pages/Services").then((m) => ({ default: m.Services })));
const ServiceDetail = page(() => import("./pages/Services").then((m) => ({ default: m.ServiceDetail })));
const HowItWorks = page(() => import("./pages/HowItWorks"));
const About = page(() => import("./pages/About"));
const Quote = page(() => import("./pages/Quote"));
const Contact = page(() => import("./pages/Contact"));
const Faq = page(() => import("./pages/Faq"));
const Help = page(() => import("./pages/Help"));
const Legal = page(() => import("./pages/Legal"));
const NotFound = page(() => import("./pages/NotFound"));
const AdminPage = page(() => import("./AdminPage")); // admin code is not loaded on public pages

const Loading = () => <div role="status" aria-label="Loading" className="mx-auto max-w-6xl space-y-4 px-4 py-16"><div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-200" /><div className="h-48 animate-pulse rounded-2xl bg-slate-200" /></div>;

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={new QueryClient()}>
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/admin/shipments" element={<AdminPage />} />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="track" element={<TrackPage />} />
            <Route path="track/:code" element={<TrackPage />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:slug" element={<ServiceDetail />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="about" element={<About />} />
            <Route path="quote" element={<Quote />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faq" element={<Faq />} />
            <Route path="help" element={<Help />} />
            <Route path="privacy" element={<Legal doc="privacy" />} />
            <Route path="terms" element={<Legal doc="terms" />} />
            <Route path="cookies" element={<Legal doc="cookies" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </QueryClientProvider>
);
