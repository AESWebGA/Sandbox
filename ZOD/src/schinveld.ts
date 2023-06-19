import z from 'zod';
import $ from 'jquery';
import {GoogleCharts} from 'google-charts';
import moment from 'moment';

const hourlyData = z.object({
    temperature_2m: z.array(z.number()),
    rain: z.array(z.number()),
    time: z.array(z.string()),
});

const weatherData = z.object({
    latitude: z.number().default(0),
    timezone: z.string(),
    hourly: hourlyData
});

let weatherDataStore: z.infer<typeof weatherData> = {
    latitude: 0,
    timezone: '',
    hourly: {
        temperature_2m: [],
        rain: [],
        time: []
    }
};
const weatherArray = z.array(z.object({
    temp: z.number(),
    rain: z.number(),
    time: z.string()
}));

let weatherArrayStore: z.infer<typeof weatherArray> = [];

$.getJSON('https://api.open-meteo.com/v1/forecast?latitude=50.97&longitude=5.98&hourly=temperature_2m,rain&past_days=1&forecast_days=5&timezone=Europe%2FBerlin', data => { // Schinveld
    weatherDataStore = weatherData.parse(data);

    for (let index = 0; index < weatherDataStore.hourly.time.length; index++) {
        weatherArrayStore.push({time: weatherDataStore.hourly.time[index], temp: weatherDataStore.hourly.temperature_2m[index], rain: weatherDataStore.hourly.rain[index]});
    }
});

// function to draw a google chart that displays a line chart for the temperature and a bar chart for the rain
function drawChart() {
    let mappedData = weatherArrayStore.map(value => {
        return [moment(value.time).format('lll'), value.temp, value.rain];
    });
    const data = GoogleCharts.api.visualization.arrayToDataTable([
        ['Time', 'c', 'rain'],
        ...mappedData]);
    const options = {
        title: 'Weather Chart - Schinveld',
        chartArea: {
            height: 500
        },
        series: {
            0: {targetAxisIndex: 0},
            1: {targetAxisIndex: 1}
        },
        vAxes: {
            0: {title: 'Temperature C'},
            1: {title: 'Rain mm'}
        },
        hAxis: {
            title: 'Time'
        }
    }
    const chart = new GoogleCharts.api.visualization.LineChart(document.getElementById('ChartDisplay'));
    chart.draw(data, options);
}

GoogleCharts.load(drawChart);