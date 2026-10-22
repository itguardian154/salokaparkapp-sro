import axios from "axios";
import API_URLS from "@/config/env";
import type {
  Segment,
  SegmentDetail,
  PaginatedResponse,
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

// GET SEGMENTS
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

// GET SEGMENT DETAILS
export const getSegmentDetails = async (): Promise<SegmentDetail[]> => {
  const response = await axios.get<PaginatedResponse<SegmentDetail>>(
   `${API_URLS.sro}segment-details`,
    {
      params: { per_page: 100 },
      headers: getAuthHeaders(),
    },
  );

  return response.data.data;
};