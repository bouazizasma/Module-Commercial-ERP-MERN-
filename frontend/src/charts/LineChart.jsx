import React from "react";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

export default function LineChart({ labels = [], entrees = [], sorties = [] }) {
  // Vérification des données
  if (labels.length === 0 || entrees.length === 0 || sorties.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Aucune donnée disponible pour afficher le graphique
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Entrées",
        data: entrees,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Sorties",
        data: sorties,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  // Dans votre composant LineChart, modifiez les options :
const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { 
      position: "top",
    },
    title: { 
      display: true, 
      text: "Fréquence des entrées et sorties par Semaine",
      font: {
        size: 16
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Quantité'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Mois'
      }
    }
  }
};
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}