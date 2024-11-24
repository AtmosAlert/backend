const data = require('./areaCodes.json');

function decodeSAME(sameCode) {
    state= null
    county = null

    const stateFIPS = sameCode.slice(1, 3);
    const countyFIPS = sameCode.slice(3); 
    
    state = data.find(row =>
        row["State Code (FIPS)"] === stateFIPS &&
        row["County Code (FIPS)"] === '000' && row["County Subdivision Code (FIPS)"] === '00000' && row["Place Code (FIPS)"] === '00000' && row["Consolidtated City Code (FIPS)"] === '00000'
    )['Area Name (including legal/statistical area description)'];

    county = data.find(row => row["State Code (FIPS)"] === stateFIPS &&
        row["County Code (FIPS)"] === countyFIPS && row["County Subdivision Code (FIPS)"] === '00000' && row["Place Code (FIPS)"] === '00000' && row["Consolidtated City Code (FIPS)"] === '00000'
    )['Area Name (including legal/statistical area description)'];

    return {
        'State': state,
        'County': county,
    };
    
}

function encode(state, county) {
    if (!state) {
        return null;  // Early exit if 'state' is not provided
    }

    const stateLower = state.toLowerCase();  // Optimize by lowering case once
    let countyLower = county ? county.toLowerCase() : null;

    // Find the appropriate data row based on state and optionally county
    const info = data.find(row => {
        return row['State Name'].toLowerCase() === stateLower &&
               (!countyLower || row['County'].toLowerCase() === countyLower);
    });

    if (!info) {
        return null;  // Return null if no matching info is found
    }

    if (countyLower && info['County Code (FIPS)']) {
        return {
            zone: `${info['State Abbreviation']}Z${info['County Code (FIPS)']}`
        };
    } else {
        return {
            area: info['State Abbreviation']
        };
    }
}



function decode(code) {
    // Extract state abbreviation and county code from the UGC code
    const abr = code.slice(0, 2);
    const countyCode = code.slice(3);

    const stateInfo = data.find(row => row['State Abbreviation'] === abr);
    if (!stateInfo) {
        console.error('No state found for abbreviation:', abr);
        return null;
    }

    const countyInfo = data.find(row => row['State Abbreviation'] === abr && row['County Code (FIPS)'] === countyCode);

    // Return the collected information
    return {
        'State Abr': abr,
        'State Name': stateInfo['State Name'],
        'State Code': stateInfo['State Code (FIPS)'],
        'County Name': countyInfo && countyInfo['County'],
        'County Code': countyCode
    };
}

module.exports = {encode,decode}