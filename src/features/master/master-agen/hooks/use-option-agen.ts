
import { useCallback, useEffect, useState } from "react";

import { getOptionMasterAgent } from "../service/master-agen-service";
import type {
  GetOptionAgentParams,
  OptionAgent,
} from "../types/master-agen";

const DEFAULT_ITEM_PER_PAGE = 25;

type UseOptionAgentOptions = {
  label?: string;
  province_name?: string;
  city_name?: string;
  is_active?: boolean;
};

export const useOptionAgent = ({
  label,
  province_name,
  city_name,
  is_active,
}: UseOptionAgentOptions = {}) => {
  const [optionAgents, setOptionAgents] = useState<OptionAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearchValue] = useState("");
  const [page, setPageValue] = useState(1);
  const [perPage, setPerPageValue] = useState(DEFAULT_ITEM_PER_PAGE);
  const [refreshKey, setRefreshKey] = useState(0);

  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAgent = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const params: GetOptionAgentParams = {
          ...(is_active !== undefined && {
            "filter[is_active]": is_active ? "1" : "0",
          }),
          ...(search.trim() && {
            "search": search.trim(),
          }),

        };

        const response = await getOptionMasterAgent(params, signal);

        if (signal.aborted) return;

        setOptionAgents(response.data);
      } catch (err: unknown) {
        if (signal.aborted) return;

        console.error("Gagal mengambil data master agen:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data master agen.",
        );

        setOptionAgents([]);
        setTotalData(0);
        setTotalPages(0);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [search, page, perPage, label, province_name, city_name, is_active],
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
    optionAgents,
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

export default useOptionAgent;
