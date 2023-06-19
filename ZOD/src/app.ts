import z from 'zod';
import $ from 'jquery';
import {GoogleCharts} from 'google-charts';

const hourlyData = z.object({
    temperature_2m: z.array(z.number()),
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
        time: []
    }
};
const weatherArray = z.array(z.object({
    temp: z.number(),
    time: z.string()
}));

let weatherArrayStore: z.infer<typeof weatherArray> = [];

//$.getJSON('https://api.open-meteo.com/v1/forecast?latitude=53.52&longitude=-1.13&hourly=temperature_2m&past_days=1&forecast_days=5&timezone=GMT', data => { // Doncaster
//$.getJSON('https://api.open-meteo.com/v1/forecast?latitude=50.97&longitude=5.98&hourly=temperature_2m&past_days=1&forecast_days=5&timezone=GMT', data => { // Schinveld
$.getJSON('https://api.open-meteo.com/v1/forecast?latitude=52.18&longitude=-1.47&hourly=temperature_2m&forecast_days=5&timezone=GMT', data => {
    weatherDataStore = weatherData.parse(data);

    for (let index = 0; index < weatherDataStore.hourly.time.length; index++) {
        weatherArrayStore.push({time: weatherDataStore.hourly.time[index], temp: weatherDataStore.hourly.temperature_2m[index]});
    }
});

GoogleCharts.load(drawChart);

function drawChart() {
    let mappedData = weatherArrayStore.map(value => {
        return [value.time, value.temp];
    });
    const data = GoogleCharts.api.visualization.arrayToDataTable([
        ['Time', 'c'],
        ...mappedData]);
    const options = {
        title: 'Weather Chart - Gaydon',
        chartArea: {
            height: 600
        }
    }
    const chart = new GoogleCharts.api.visualization.LineChart(document.getElementById('ChartDisplay'));
    chart.draw(data, options);
}