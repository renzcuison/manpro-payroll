import { QueryClient } from '@tanstack/react-query';

function generateQueryClient () {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 600000, // 10 minutes
				cacheTime: 900000, // default cacheTime is 5 minutes; doesn't make sense for staleTime to exceed cacheTime
				refetchOnMount: false,
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
			},
		},
	});
}

export const queryClient = generateQueryClient();