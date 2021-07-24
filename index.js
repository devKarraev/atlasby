const fetch = require('node-fetch')
const { Telegraf } = require('telegraf')
const Pageres = require('pageres');

require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN);

const NEEDED_TIMES = ['19', '18']
const ATLAS_DAY = process.env.ATLAS_DAY
const ATLAS_MONTH = process.env.ATLAS_MONTH
const CHAT_ID = 140385197

const fetchData = async () => {
    const response = await fetch(`https://atlasbus.by/api/search?from_id=c625144&to_id=c625665&calendar_width=30&date=2021-${ATLAS_MONTH}-${ATLAS_DAY}&passengers=1`)
    const data = await response.json()

    const rides = data.rides.map(ride => {
        return {freSeats: ride.freeSeats, departure: ride.departure.split('T').pop()}
    })

    if (rides.length === 0) {
        await fetchData()
    }

    const filteredRides = rides.filter(ride => {
        for (time of NEEDED_TIMES) {
            if (ride.departure.indexOf(time) === 0 && ride.freSeats > 0) {
                return true;
            }
        }
    })

    if (filteredRides.length > 0) {
        await sendMessage(filteredRides)
    }
}

async function sendMessage(filteredRides) {
    const table = `<table style="border: 4px double black;">
                        <tr>
                            <th style="border: 1px solid black;">Mest</th>
                            <th style="border: 1px solid black;">Vremya</th>
                        </tr>
                        ${filteredRides.map(ride => {
                            return `<tr><td style="border: 1px solid black">${ride.freSeats}</td><td style="border: 1px solid black">${ride.departure}</td></tr>`
                        }).join('')}
                    </table>`

    new Pageres()
        .src(`data:text/html,${table}`, ['300x300'], {filename: 'schedule'})
        .run()
        .then(async image => {
            await bot.telegram.sendPhoto(CHAT_ID, {source: image[0]})
            await bot.telegram.sendMessage(CHAT_ID,`<a href="https://atlasbus.by/%D0%9C%D0%B0%D1%80%D1%88%D1%80%D1%83%D1%82%D1%8B/%D0%9C%D0%B8%D0%BD%D1%81%D0%BA/%D0%9C%D0%BE%D0%B3%D0%B8%D0%BB%D1%91%D0%B2?date=2021-${ATLAS_DAY}-${ATLAS_MONTH}&passengers=1">Ssilka</a>`, {parse_mode: 'HTML'})
        })
        .catch(e => console.log(e))
}

setInterval(fetchData, 30000)

bot.launch()
