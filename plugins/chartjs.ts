import { Chart, ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale } from 'chart.js'

export default defineNuxtPlugin(() => {
  Chart.register(ArcElement, Tooltip, Legend, Title, BarElement, CategoryScale, LinearScale)
})
