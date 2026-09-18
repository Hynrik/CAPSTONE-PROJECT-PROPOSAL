import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  counts?: number[];
}

export default function StatusChart({ counts }: Props) {
  const labels = ["Active", "Inactive", "Pending"];
  const resolved = counts ?? [98, 12, 10];

  const data = {
    labels,
    datasets: [
      {
        label: "Members",
        data: resolved,
        backgroundColor: [
          "rgba(25, 135, 84, 0.85)",
          "rgba(255, 193, 7, 0.85)",
          "rgba(220, 53, 69, 0.85)",
        ],
        borderColor: [
          "#198754",
          "#ffc107",
          "#dc3545",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Member Status Distribution",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(15, 23, 42, 0.08)" },
      },
    },
  };

  return <Bar data={data} options={options} />;
}