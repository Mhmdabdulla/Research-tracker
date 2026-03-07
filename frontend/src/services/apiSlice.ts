// src/services/apiSlice.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ResearchPaper,
  CreatePaperRequest,
  UpdatePaperRequest,
  ListPapersParams,
  ApiResponse,
  PaginatedResponse,
  DashboardSummary,
  RecentPaper,
  FunnelDataPoint,
  DomainStagesDataPoint,
  CitationsImpactDataPoint,
} from "../types/api.types";

// ─── Tag types ────────────────────────────────────────────────────────────────
// "LIST"  — the paginated papers table (re-fetch when any paper is mutated)
// id      — a single paper row (re-fetch when that specific paper is mutated)
// "SUMMARY" — analytics summary card (re-fetch on any mutation so counts stay fresh)

const PAPER_TAG = "Paper" as const;
const ANALYTICS_TAG = "Analytics" as const;

// ─── Base query ───────────────────────────────────────────────────────────────

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

// ─── Helper: convert ListPapersParams → query string ─────────────────────────
// Arrays MUST be sent as repeated keys: domain=Chemistry&domain=Biology
// The backend's express-validator custom() does Array.isArray(val) — Express only
// sets that to true when it sees repeated keys, NOT a single comma-joined value.
// fetchBaseQuery's `params` field uses Object.entries which can't express repeated
// keys, so we build the full URL string ourselves with URLSearchParams.

function buildQueryString(params: ListPapersParams): string {
  const qs = new URLSearchParams();

  if (params.page)       qs.set("page",       String(params.page));
  if (params.limit)      qs.set("limit",      String(params.limit));
  if (params.q)          qs.set("q",          params.q);
  if (params.timePeriod) qs.set("timePeriod", params.timePeriod);
  if (params.sortBy)     qs.set("sortBy",     params.sortBy);
  if (params.sortDir)    qs.set("sortDir",    params.sortDir);

  // Repeated keys → Express parses as string[]
  // e.g. domain=Chemistry&domain=Biology  →  req.query.domain = ["Chemistry","Biology"]
  params.domain?.forEach((d) => qs.append("domain", d));
  params.stage?.forEach((s) => qs.append("stage", s));
  params.impactScore?.forEach((i) => qs.append("impactScore", i));

  const str = qs.toString();
  return str ? `?${str}` : "";
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery,

  // Tag types this slice manages
  tagTypes: [PAPER_TAG, ANALYTICS_TAG],

  endpoints: (builder) => ({

    // ── Papers ──────────────────────────────────────────────────────────────

    /**
     * GET /api/papers
     * Paginated, filtered, sorted list.
     * Provides both a list-level tag AND per-id tags so partial invalidation works.
     */
    getPapers: builder.query<PaginatedResponse<ResearchPaper>, ListPapersParams>({
      query: (params = {}) => `/papers${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              // Tag every individual paper
              ...result.data.map(({ id }) => ({ type: PAPER_TAG, id } as const)),
              // Tag the list as a whole
              { type: PAPER_TAG, id: "LIST" },
            ]
          : [{ type: PAPER_TAG, id: "LIST" }],
    }),

    /**
     * GET /api/papers/:id
     */
    getPaperById: builder.query<ApiResponse<ResearchPaper>, string>({
      query: (id) => `/papers/${id}`,
      providesTags: (_result, _err, id) => [{ type: PAPER_TAG, id }],
    }),

    /**
     * POST /api/papers
     * Invalidates the list + analytics summary so both re-fetch.
     */
    addPaper: builder.mutation<ApiResponse<ResearchPaper>, CreatePaperRequest>({
      query: (body) => ({
        url: "/papers",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: PAPER_TAG, id: "LIST" },
        { type: ANALYTICS_TAG, id: "SUMMARY" },
      ],
    }),

    /**
     * PATCH /api/papers/:id
     * Invalidates the specific paper, the list, and the analytics summary.
     */
    updatePaper: builder.mutation<
      ApiResponse<ResearchPaper>,
      { id: string; body: UpdatePaperRequest }
    >({
      query: ({ id, body }) => ({
        url: `/papers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: PAPER_TAG, id },
        { type: PAPER_TAG, id: "LIST" },
        { type: ANALYTICS_TAG, id: "SUMMARY" },
      ],
    }),

    /**
     * DELETE /api/papers/:id
     * Invalidates the specific paper, the list, and all analytics
     * (counts change after a delete).
     */
    deletePaper: builder.mutation<void, string>({
      query: (id) => ({
        url: `/papers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: PAPER_TAG, id },
        { type: PAPER_TAG, id: "LIST" },
        { type: ANALYTICS_TAG, id: "SUMMARY" },
        { type: ANALYTICS_TAG, id: "RECENT" },
      ],
    }),

    // ── Analytics ────────────────────────────────────────────────────────────

    /**
     * GET /api/analytics/summary
     * Provides SUMMARY tag — invalidated by any paper mutation.
     */
    getSummary: builder.query<ApiResponse<DashboardSummary>, void>({
      query: () => "/analytics/summary",
      providesTags: [{ type: ANALYTICS_TAG, id: "SUMMARY" }],
    }),

    /**
     * GET /api/analytics/recent-papers?limit=N
     */
    getRecentPapers: builder.query<ApiResponse<RecentPaper[]>, number | void>({
      query: (limit = 5) => `/analytics/recent-papers?limit=${limit}`,
      providesTags: [{ type: ANALYTICS_TAG, id: "RECENT" }],
    }),

    /**
     * GET /api/analytics/funnel
     */
    getFunnel: builder.query<ApiResponse<FunnelDataPoint[]>, void>({
      query: () => "/analytics/funnel",
      providesTags: [{ type: ANALYTICS_TAG, id: "FUNNEL" }],
    }),

    /**
     * GET /api/analytics/domain-stages
     */
    getDomainStages: builder.query<ApiResponse<DomainStagesDataPoint[]>, void>({
      query: () => "/analytics/domain-stages",
      providesTags: [{ type: ANALYTICS_TAG, id: "DOMAIN_STAGES" }],
    }),

    /**
     * GET /api/analytics/citations-impact
     */
    getCitationsImpact: builder.query<ApiResponse<CitationsImpactDataPoint[]>, void>({
      query: () => "/analytics/citations-impact",
      providesTags: [{ type: ANALYTICS_TAG, id: "CITATIONS_IMPACT" }],
    }),
  }),
});

// ─── Export auto-generated hooks ──────────────────────────────────────────────

export const {
  // Papers
  useGetPapersQuery,
  useGetPaperByIdQuery,
  useAddPaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  // Analytics
  useGetSummaryQuery,
  useGetRecentPapersQuery,
  useGetFunnelQuery,
  useGetDomainStagesQuery,
  useGetCitationsImpactQuery,
} = apiSlice;