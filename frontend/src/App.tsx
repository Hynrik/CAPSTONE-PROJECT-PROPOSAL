import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./features/routes/AppRoute";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}