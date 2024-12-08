const axios = require('axios');
require('dotenv').config();

const {encode,decode, filterDuplicates,isDateInPast} = require('../utils')

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

const eventNames = [
    "Brisk Wind Advisory",
    "Extreme Wind Warning",
    "High Wind Warning",
    "High Wind Watch",
    "Hurricane Force Wind Warning",
    "Hurricane Force Wind Watch",
    "Lake Wind Advisory",
    "Small Craft Advisory For Winds",
    "Wind Advisory",
    "Wind Chill Advisory",
    "Wind Chill Warning",
    "Wind Chill Watch",
    "Hurricane Local Statement",
    "Hurricane Warning",
    "Hurricane Watch",
    "Dust Storm Warning",
    "Ice Storm Warning",
    "Severe Thunderstorm Warning",
    "Severe Thunderstorm Watch",
    "Storm Surge Warning",
    "Storm Surge Watch",
    "Tropical Storm Local Statement",
    "Tropical Storm Warning",
    "Tropical Storm Watch",
    "Storm Warning",
    "Storm Watch",
    "Winter Storm Warning",
    "Winter Storm Watch",
    "Flash Flood Statement",
    "Flash Flood Warning",
    "Flash Flood Watch",
    "Flood Advisory",
    "Flood Statement",
    "Flood Warning",
    "Flood Watch",
    "Lakeshore Flood Advisory",
    "Lakeshore Flood Statement",
    "Lakeshore Flood Warning",
    "Lakeshore Flood Watch",
    "Small Stream Flood Advisory",
    "Urban And Small Stream Flood Advisory",
    "Arroyo And Small Stream Flood Advisory",
    "Coastal Flood Advisory",
    "Coastal Flood Statement",
    "Coastal Flood Warning",
    "Coastal Flood Watch"
  ];
  

const getAlerts = async (req,res,next) => {
    try {
        const { state,county,severity } = req.query || {};
        if (!state){
            throw {
                message: "State cannot be undefined",
                code: 400,
            }
        }

        if (severity && !["Minor", "Moderate", "Severe", "Extreme"].includes(severity)){
            throw {
                message: "Severity needs to be either 'Minor', 'Moderate', 'Severe' or 'Extreme'",
                code: 400,
            }
        }

        searchParam = encode(state,county)
        params= {
            limit: req.body.limit,
            start: req.body.start,
            end: req.body.end,
            region: req.body.region,
            region_type: req.body.region_type,
            urgency: req.body.urgency,
            certainty: req.body.certainty,
            status:"actual",
            message_type: "alert",
            // Params
            ...(severity && { severity }),
            ...searchParam
        }
        console.log(params)
    
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
        
        currentDate = new Date()

        data = data.features.map((event,index) => ({
            id: event.id,
            active: !isDateInPast(currentDate,event.properties.ends),
            areas: areas[index],
            geocode: event.properties.geocode.UGC,
            senderName: event.properties.senderName,
            headline: event.properties.headline,
            // description: event.properties.description,
            
            sent:new Date(event.properties.sent), //The time when the alert message was originally sent.
            effective: new Date(event.properties.effective), //The time when the information in the alert message becomes effective.
            eventStartTime: new Date(event.properties.onset), //The expected start time of the event or situation that the alert is about.
            expires: new Date(event.properties.expires), // The time after which the information in the alert message is no longer considered valid.
            eventEndTime: new Date(event.properties.ends), //The expected end time of the event or situation that the alert is about.
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

        data = data.filter(event => {
            return eventNames.includes(event.event) 
        });
        
        data = filterDuplicates(data,['sent','effective','eventStartTime','expires','eventEndTime'])
        
        return res.status(200).json({
            data
        })

    } catch (error) {
        const statusCode = error.code || 500;
        return res.status(statusCode).json({
          message: error.message || "An unexpected error occurred",
          error: true,
        });}
};



module.exports = { getAlerts };
