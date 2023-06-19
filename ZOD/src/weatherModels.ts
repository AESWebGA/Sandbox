import z from 'zod';

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

const weatherArray = z.array(z.object({
    temp: z.number(),
    rain: z.number(),
    time: z.string()
}));

// export classes
export {hourlyData, weatherData, weatherArray};