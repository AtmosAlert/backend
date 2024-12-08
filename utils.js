const data = require('./areaCodes.json');


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

function filterDuplicates(array, uniqueAttributes) {
    const seen = new Set();
    
    return array.filter((item) => {
      // Create a unique identifier based on the attributes
      const key = uniqueAttributes.map(attr => item[attr]).join('|');
      
      if (seen.has(key)) {
        return false; // Duplicate found
      } else {
        seen.add(key);
        return true; // Unique item
      }
    });
  }
  
  function isDateInPast(currentDate, givenDateString) {
    const givenDate = new Date(givenDateString); // Parse the given date
  
    if (isNaN(givenDate.getTime())) {
      throw new Error("Invalid date string");
    }
  
    return givenDate < currentDate; // Return true if the given date is in the past
  }
  

module.exports = {encode,decode,filterDuplicates,isDateInPast}