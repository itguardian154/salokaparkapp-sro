
import { useCallback, useEffect, useState } from "react";

import { getMasterAgent } from "../service/master-agen-service";
import type {
  Agent,
  GetAgentParams,
} from "../types/master-agen";

const DEFAULT_ITEM_PER_PAGE = 25;

type UseMasterAgentOptions = {
  city?: string;
  association_name?: string;
  is_active?: string;
};

export const useMasterAgent = ({
  city,
  association_name,
  is_active,
}: UseMasterAgentOptions = {}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearchValue] = useState("");
  const [page, setPageValue] = useState(1);
  const [perPage, setPerPageValue] = useState(
    DEFAULT_ITEM_PER_PAGE,
  );

  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAgent = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const params: GetAgentParams = {
          page,
          per_page: perPage,

          ...(search.trim() && {
            "filter[search]": search.trim(),
          }),

          ...(city && {
            "filter[city]": city,
          }),

          ...(association_name && {
            "filter[association_name]": association_name,
          }),

          ...(is_active !== undefined &&
            is_active !== "" && {
              "filter[is_active]":
                is_active === "true"
                  ? "1"
                  : is_active === "false"
                    ? "0"
                    : is_active,
            }),
        };

        const response = await getMasterAgent(
          params,
          signal,
        );

        if (signal.aborted) return;

        setAgents(response.data);
        setTotalData(response.meta.total);
        setTotalPages(response.meta.last_page || 1);
      } catch (err: unknown) {
        if (signal.aborted) return;

        console.error(
          "Gagal mengambil data master agen:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data master agen.",
        );

        setAgents([]);
        setTotalData(0);
        setTotalPages(1);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [
      page,
      perPage,
      search,
      city,
      association_name,
      is_active,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetchAgent(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchAgent, refreshKey]);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPageValue(1);
  }, []);

  const setPage = useCallback((value: number) => {
    setPageValue(value);
  }, []);

  const setPerPage = useCallback((value: number) => {
    setPerPageValue(value);
    setPageValue(1);
  }, []);

  const refetch = useCallback(() => {
    setRefreshKey((previous) => previous + 1);
  }, []);

  return {
    agents,
    loading,
    error,
    search,
    page,
    perPage,
    totalData,
    totalPages,
    setSearch,
    setPage,
    setPerPage,
    refetch,
  };
};

export default useMasterAgent;
