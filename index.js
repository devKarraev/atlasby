const fetch = require('node-fetch')
const nodemailer = require("nodemailer");

const NEEDED_TIMES = ['19', '20', '21']

const fetchData = async () => {
    const response = await fetch('https://atlasbus.by/api/search?from_id=c625144&to_id=c625665&calendar_width=30&date=2021-06-18&passengers=1')
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
        sendMail(filteredRides)
    }
}

async function sendMail(filteredRides) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: 'login', // generated ethereal user
            pass: 'pass', // generated ethereal password
        },
    });

    const table = `<table border="1" width="50%" cellpadding="5">
                        <tr>
                            <th>Мест</th>
                            <th>Время</th>
                        </tr>
                        ${filteredRides.map(ride => {
                            return `<tr><td>${ride.freSeats}</td><td>${ride.departure}</td></tr>`
                        }).join('')}
                    </table>
                    <p>
                        <a href="https://atlasbus.by/%D0%9C%D0%B0%D1%80%D1%88%D1%80%D1%83%D1%82%D1%8B/%D0%9C%D0%B8%D0%BD%D1%81%D0%BA/%D0%9C%D0%BE%D0%B3%D0%B8%D0%BB%D1%91%D0%B2?date=2021-06-18&passengers=1">
                            ссылка
                        </a>
                    </p>`

    await transporter.sendMail({
        from: 'Shitan machine', // sender address
        to: "rasulkaraev3@gmail.com", // list of receivers
        subject: "🔥 SHAITAN MACHINE 🔥", // Subject line
        text: JSON.stringify(filteredRides) + '\n', // plain text body
        html: table
    });
}

setInterval(fetchData, 30000)
