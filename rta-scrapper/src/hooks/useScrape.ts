import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import type { ApiResponse } from "@/types";

type Filters = Record<string, any>;

// Utility to clean empty values
const cleanObject = (obj: Filters): Filters => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
    )
  );
};

// Read backend URL from env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const fetchScrape = async (filters: Filters): Promise<ApiResponse> => {
  if (!BACKEND_URL) throw new Error("VITE_BACKEND_URL is not defined");

  const res = await fetch(`${BACKEND_URL}/api/scrape/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Scrape failed: ${message || res.statusText}`);
  }

  return res.json();
};

export const useScrape = () => {
  const [filters, setFilters] = useState<Filters | null>(null);

  const query = useQuery({
    queryKey: ["scrape", filters ? cleanObject(filters) : null],
    queryFn: () => fetchScrape(cleanObject(filters!)),
    enabled: filters !== null, // only run when filters are set
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
  });

  const mutate = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return {
    mutate,
    data: query.data,
    // Only show pending if filters are set (user has searched)
    isPending: filters !== null && query.isPending,
    error: query.error,
    isSuccess: query.isSuccess,
  };
};
