import z from 'zod';
import $ from 'jquery';
import { GoogleCharts } from 'google-charts';
import moment from 'moment';
import { weatherData, weatherArray } from './weatherModels';

let chart: any;

// This code declares a variable, `weatherDataStore`, which is an object containing information about the weather.
let weatherDataStore: z.infer<typeof weatherData> = {
    latitude: 0,
    timezone: '',
    hourly: {
        temperature_2m: [],
        rain: [],
        time: []
    }
};

let weatherArrayStore: z.infer<typeof weatherArray> = [];

// This code uses the jQuery library to make a request to the Open Meteo API.
function getWeatherData(lat: Number, lon: Number, days: Number, timezone: String) {
    //$.getJSON('https://api.open-meteo.com/v1/forecast?latitude=50.97&longitude=5.98&hourly=temperature_2m,rain&past_days=1&forecast_days=5&timezone=Europe%2FBerlin', data => { // Schinveld
    $.getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain&past_days=1&forecast_days=${days}&timezone=${timezone}`, data => { // Schinveld
        let weatherDataStore = weatherData.parse(data);

        if (weatherDataStore.hourly.time && weatherDataStore.hourly.time.length > 0) {
            for (let index = 0; index < weatherDataStore.hourly.time.length; index++) {
                let time = weatherDataStore.hourly.time[index];
                if (time) {
                    weatherArrayStore.push({
                        time: time,
                        temp: weatherDataStore.hourly.temperature_2m[index],
                        rain: weatherDataStore.hourly.rain[index]
                    });
                }
            }
        }
        GoogleCharts.load(drawChart);
    });
}

// function to draw a google chart that displays a line chart for the temperature and a bar chart for the rain
function drawChart() {
    if(weatherArrayStore.length === 0) {
        return;
    }
    let mappedData = weatherArrayStore.map(value => {
        return [value.time, value.temp, value.rain];
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
            0: { targetAxisIndex: 0 },
            1: { targetAxisIndex: 1 }
        },
        vAxes: {
            0: { title: 'Temperature C' },
            1: { title: 'Rain mm' }
        },
        hAxis: {
            title: 'Time'
        }
    }
        
    chart = new GoogleCharts.api.visualization.LineChart(document.getElementById('ChartDisplay'));
    chart.draw(data, options);
}

// fuction to call getWeatherData that is used to run the page
function run() {
    // call getWeatherData every 5 minutes
    onDaysChanged(document.getElementById('days') as HTMLSelectElement);
    setInterval(onDaysChanged, 300000);
}

function onDaysChanged() {
    let dropdown = document.getElementById('days') as HTMLSelectElement;
    let days = Number(dropdown.value);
    if (days) {
        weatherArrayStore = [];
        getWeatherData(50.97, 5.98, days, 'Europe%2FBerlin');
    }
    $('.title').html(`Weather forcast for the next ${days} days`);
}

run();