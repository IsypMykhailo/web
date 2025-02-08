<template>
    <Line v-if="chartData !== null" :data="chartData" :options="options" />
</template>

<script>
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip, Filler} from 'chart.js'
import {Line} from 'vue-chartjs'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
)

export default {
    name: 'AttendanceLineChart',
    components: {
        Line
    },
    data() {
        return {
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    filler: {
                        propagate: false,
                    }
                },
                interaction: {
                    intersect: false,
                }
            },
        }
    },
    computed: {
        chartData() {
            if (this.chartProps === undefined || this.chartProps === null)
                return null

            const data = {
                labels: [],
                datasets: [{
                    label: this.$t('charts.percentage'),
                    lineTension: 0.25,
                    backgroundColor: window.getComputedStyle(document.documentElement).getPropertyValue('--button-transparent-background-color'),
                    borderColor: window.getComputedStyle(document.documentElement).getPropertyValue('--button-background-color'),
                    data: [],
                    fill: {
                        target: 'start',
                    }
                }]
            }

            const currentYear = new Date().getFullYear()
            for (const prop of this.chartProps) {
                if (currentYear !== prop.year)
                    data.labels.push(`${this.$t(`months.short.${prop.month - 1}`) }, ${prop.year}`)
                else
                    data.labels.push(this.$t(`months.full.${prop.month - 1}`))

                data.datasets[0].data.push(prop.percentage)
            }

            return data
        }
    },
    props: {
        chartProps: {
            type: Array,
        }
    }
}
</script>