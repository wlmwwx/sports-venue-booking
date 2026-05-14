"use client";

import { getToken } from "./auth";

export interface Venue {
  _id: string;
  name: string;
  sportTypes: string[];
  address: string;
  latitude: number;
  longitude: number;
  businessHours: string;
  phone: string;
  photos: string[];
  description: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectReason?: string;
  ownerId: string;
  createdAt: string;
}

async function callVenueAdmin(action: string, payload: Record<string, unknown> = {}) {
  const token = getToken();
  const res = await fetch("/api/venue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, token, ...payload }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

export async function createVenue(venue: Omit<Venue, "_id" | "status" | "ownerId" | "createdAt">) {
  return callVenueAdmin("create", venue);
}

export async function getMyVenues(): Promise<Venue[]> {
  const data = await callVenueAdmin("myVenues");
  return data.venues;
}

export async function getVenue(venueId: string): Promise<Venue> {
  const data = await callVenueAdmin("get", { venueId });
  return data.venue;
}

export async function updateVenue(venueId: string, fields: Record<string, unknown>) {
  return callVenueAdmin("update", { venueId, ...fields });
}

// 平台端
export async function listPending(): Promise<Venue[]> {
  const data = await callVenueAdmin("listPending");
  return data.venues;
}

export async function approveVenue(venueId: string) {
  return callVenueAdmin("approve", { venueId });
}

export async function rejectVenue(venueId: string, reason: string) {
  return callVenueAdmin("reject", { venueId, reason });
}

export async function suspendVenue(venueId: string) {
  return callVenueAdmin("suspend", { venueId });
}
