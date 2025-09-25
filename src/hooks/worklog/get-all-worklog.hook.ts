import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { GetAllWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { Worklogs } from "@/domain/models/worklog/get-worklogs.dto";
import { useCallback, useEffect, useState } from "react";

export const useGetAllWorklogs = (useCase: GetAllWorklogUseCase) => {
  const [worklogs, setWorklogs] = useState<Worklogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getWorklogs = async (limit: number, page: number) => {
    setLoading(true);
    try {
      const worklogs = await useCase.execute(limit, page);
      setWorklogs(worklogs);
      return worklogs;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWorklogs(ITEMS_PER_PAGE, 1);
  }, []);

  return { worklogs, loading, error };
};
