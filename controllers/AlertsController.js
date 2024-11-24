const axios = require('axios');
require('dotenv').config();

const {encode,decode} = require('../utils')

const options = {
    timeZone: "America/New_York", // Time zone for UTC-5
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false // Use 24-hour format; set to true for 12-hour format
};

const formatter = new Intl.DateTimeFormat("en-US", options);


const getAlerts = async (req,res,next) => {

    searchParam = encode(req.body.state,req.body.county)
    params= {
        limit: req.body.limit,
        start: req.body.start,
        end: req.body.end,
        region: req.body.region,
        region_type: req.body.region_type,
        urgency: req.body.urgency,
        severity: req.body.severity,
        certainty: req.body.certainty,
        status:req.body.status,
        message_type: req.body.message_type,
        ...searchParam
    }
    console.log(params)
    try {
        const apiUrl = !req.body.active 
        ? process.env.WEATHER_API_URL 
        : `${process.env.WEATHER_API_URL}/active`;

        console.log(apiUrl)
        const response = await axios.get(apiUrl, { params });
                data = response.data

        const areas = data.features.map(feature => {
            return feature.properties.geocode.UGC.map(code => {
                const decodedData = decode(code);
        
                // Check if decodedData exists and has the required properties
                if (!decodedData || !decodedData['State Name']) {
                    return null
                }
        
                const stateName = decodedData['State Name'];
                const countyName = decodedData['County Name'] || 'N/A';
        
                return req.body.simple
                    ? `${stateName},${countyName}`
                    : {
                        State: stateName,
                        County: countyName,
                    };
            });
        });
        
        
        // data = data.features.map(event => ({
        //     ...event,
        //     properties: {
        //         areaDesc: event.properties.areaDesc,
        //         geocode: event.properties.geocode,
        //         affectedZones: event.properties.affectedZones,
        //         senderName: event.properties.senderName,
        //         headline: event.properties.headline,
        //         description: event.properties.description,
        //         sent: event.properties.sent,
        //         effective: event.properties.effective,
        //         onset: event.properties.onset,
        //         expires: event.properties.expires,
        //         ends: event.properties.ends,
        //         status: event.properties.status,
        //         category: event.properties.category,
        //         severity: event.properties.severity,
        //         certainty: event.properties.certainty,
        //         urgency: event.properties.urgency,
        //         event: event.properties.event,
        //         sender: event.properties.sender
        //     }
        // }));
        data = data.features.map((event,index) => ({
            areas: areas[index],
            geocode: event.properties.geocode.UGC,
            senderName: event.properties.senderName,
            headline: event.properties.headline,
            // description: event.properties.description,
            
            sent:formatter.format(new Date(event.properties.sent)), //The time when the alert message was originally sent.
            effective: formatter.format(new Date(event.properties.effective)), //The time when the information in the alert message becomes effective.
            eventStartTime: formatter.format(new Date(event.properties.onset)), //The expected start time of the event or situation that the alert is about.
            expires: formatter.format(new Date(event.properties.expires)), // The time after which the information in the alert message is no longer considered valid.
            eventEndTime: formatter.format(new Date(event.properties.ends)), //The expected end time of the event or situation that the alert is about.
            status: event.properties.status,
            category: event.properties.category, //The category of the event leading to the alert (e.g., Meteorological, Geological, Safety, Security).
            severity: event.properties.severity,
            certainty: event.properties.certainty,
            urgency: event.properties.urgency,
            event: event.properties.event,
            sender: event.properties.sender
            
        }));

        data = data.filter(event => {
            return event.areas && event.areas.some(area => area !== null);
        });
        return data;
    } catch (error) {
        throw error
    }
};

module.exports = { getAlerts };
