import { useCallback, useEffect, useState } from "react";
import { getMasterAgent } from "../service/master-agen-service";
import type { GetAgentParams, Agent } from "../types/master-agen";

type MasterAgentFilters = Pick<
  GetAgentParams,
  "city" | "association_name" | "is_active"
>;

export const useMasterAgent = ({
  city,
  association_name,
  is_active,
}: MasterAgentFilters = {}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetAgentParams = {
        page,
        per_page: perPage,
        search: search.trim() || undefined,
        city,
        association_name: association_name || undefined,
        is_active,
      };

      const response = await getMasterAgent(params);

      setAgents(response.data);
      setTotalData(response.meta.total);
      setTotalPages(response.meta.last_page);
    } catch (err) {
      console.error("Gagal mengambil data master agen:", err);
      setError("Gagal mengambil data master agen.");
      setAgents([]);
      setTotalData(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    perPage,
    search,
    city,
    association_name,
    is_active,
  ]);

  useEffect(() => {
    void fetchAgent();
  }, [fetchAgent]);

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const changePage = (value: number) => {
    setPage(value);
  };

  const changePerPage = (value: number) => {
    setPerPage(value);
    setPage(1);
  };

  return {
    agents,
    loading,
    error,
    search,
    page,
    perPage,
    totalData,
    totalPages,
    setSearch: changeSearch,
    setPage: changePage,
    setPerPage: changePerPage,
    refetch: fetchAgent,
  };
};
