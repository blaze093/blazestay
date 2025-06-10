"use client"

import { useEffect, useState } from "react"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface AdminChartProps {
  type?: "line" | "bar" | "area"
  height?: number
}

export default function AdminChart({ type = "line", height = 300 }: AdminChartProps) {
  // Sample data - in a real app, this would come from your API
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    // Generate sample data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    const lastSixMonths = months.slice(currentMonth - 5 >= 0 ? currentMonth - 5 : 0, currentMonth + 1)

    // Generate random data for demonstration
    const generateData = () =>
      Array.from({ length: lastSixMonths.length }, () => Math.floor(Math.random() * 1000) + 100)

    const data = {
      labels: lastSixMonths,
      datasets: [
        {
          label: type === "line" || type === "area" ? "Monthly Sales" : "Orders",
          data: generateData(),
          borderColor: "#2e7d32",
          backgroundColor:
            type === "area"
              ? "rgba(46, 125, 50, 0.2)"
              : type === "bar"
                ? "rgba(46, 125, 50, 0.7)"
                : "rgba(46, 125, 50, 1)",
          fill: type === "area",
          tension: 0.4,
        },
        ...(type === "bar"
          ? [
              {
                label: "Revenue",
                data: generateData().map((val) => val * 1.5),
                borderColor: "#f9a825",
                backgroundColor: "rgba(249, 168, 37, 0.7)",
              },
            ]
          : []),
      ],
    }

    setChartData(data)
  }, [type])

  const options: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  }

  return (
    <div style={{ height: `${height}px` }}>
      {type === "line" && <Line data={chartData} options={options} />}
      {type === "bar" && <Bar data={chartData} options={options} />}
      {type === "area" && <Line data={chartData} options={options} />}
    </div>
  )
}
