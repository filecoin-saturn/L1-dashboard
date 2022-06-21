import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

const { datasets, elements, interaction, plugins, scales } = ChartJS.defaults
// console.log(ChartJS.defaults)

const defaultColor = 'rgb(226 232 240)' // text-slate-200
const defaultColorLight = 'rgb(226 232 240 / .1)'

ChartJS.defaults.font.family = "'Roboto', 'Helvetica Neue', sans-serif"
ChartJS.defaults.color = defaultColor
ChartJS.defaults.backgroundColor = 'rgb(53 162 235)'
ChartJS.defaults.borderColor = defaultColorLight

datasets.line.fill = 'origin'
datasets.line.spanGaps = false

elements.point.radius = 2
elements.point.hoverRadius = 4

elements.line.borderColor = 'rgb(53 162 235)'
elements.line.backgroundColor = 'rgb(53 162 235 / 0.1)'
elements.line.borderWidth = 1.5
elements.line.tension = 0.1

interaction.intersect = false
interaction.mode = 'index'

plugins.legend.display = false

plugins.title.font = {
    size: 16,
    weight: 'bold'
}

plugins.tooltip.yAlign = 'top'

scales.linear.beginAtZero = true
