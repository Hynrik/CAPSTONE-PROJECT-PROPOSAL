import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Props {
  labels?: string[];
  data?: number[];
}

export default function WeeklyChart({ labels, data: series }: Props) {
  const resolvedLabels = labels ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const resolvedData = series ?? [1200, 1900, 3000, 2500, 3200, 2800, 4000];

  const data = {
    labels: resolvedLabels,
    datasets: [
      {
        label: "Monthly Collection",
        data: resolvedData,
        borderColor: "#198754",
        backgroundColor: "rgba(25,135,84,0.18)",
        pointBackgroundColor: "#198754",
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Monthly Collection",
      },
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (ctx: TooltipItem<'line'>) => {
            const parsed = ctx.parsed as number | { x?: number; y?: number } | undefined;
            const v = typeof parsed === "number" ? parsed : parsed?.y ?? 0;
            return `₱${Number(v).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        grid: { color: "rgba(15, 23, 42, 0.08)" },
        beginAtZero: true,
        ticks: {
          callback: (val: number | string) => `₱${Number(val).toLocaleString()}`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}