import { useQuery } from "@tanstack/react-query";
import { fetchBrewData } from "../lib/utils";
import type { BrewType } from "../types";

export function useBrewData(type: BrewType) {
    return useQuery({
        queryKey: ['brew', type],
        queryFn: () => fetchBrewData(type),
        staleTime: 1000 * 60 * 10, // 10 minutes cache
        refetchOnWindowFocus: false,
    });
}