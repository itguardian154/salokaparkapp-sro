
import axios from "axios";
import API_URLS from "@/config/env";
import type {
  Segment,
  PaginatedResponse,
  CreateSegmentPayload,
  UpdateSegmentPayload,
  SegmentDetailRecord,
} from "../types/master-segment";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login kembali.");
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

// GET LIST SEGMENTS
export const getSegments = async (): Promise<Segment[]> => {
  const response = await axios.get<PaginatedResponse<Segment>>(
    `${API_URLS.sro}segments`,
    {
      params: { per_page: 100 },
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// GET DETAIL SEGMENT BY ID
export const getSegmentById = async (
  id: number,
): Promise<SegmentDetailRecord> => {
  const response = await axios.get<{ data: SegmentDetailRecord }>(
    `${API_URLS.sro}segments/${id}`,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// CREATE SEGMENT
export const createSegment = async (
  payload: CreateSegmentPayload,
): Promise<Segment> => {
  const response = await axios.post<{ data: Segment }>(
    `${API_URLS.sro}segments`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};

// UPDATE SEGMENT
export const updateMasterSegment = async (
  id: number,
  payload: UpdateSegmentPayload,
): Promise<Segment> => {
  const response = await axios.put<{ data: Segment }>(
    `${API_URLS.sro}segments/${id}`,
    payload,
    {
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};
