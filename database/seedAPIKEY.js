const axios = require('axios');
const fs = require('fs');

const API_KEY = '';


const fetchData = async () => {
    try {
        const LIMIT = 100;
        let OFFSET = 0;

        for (let i = 1; i <= 13; i++) {
            const options = {
                method: 'GET',
                //url: https://api.aviationstack.com/v1/cities?access_key=${API_KEY}&limit=${LIMIT}&offset=${OFFSET}
            };

            const response = await axios.request(options);
            
            if (response.data && response.data.data) {
                const newData = response.data.data;
    
                if (fs.existsSync('./data/cities.json')) {
                    const existingData = JSON.parse(fs.readFileSync('./data/cities.json', 'utf8'));
                    
                    const updatedData = Array.isArray(existingData) ? [...existingData, ...newData] : newData;
                    
                    fs.writeFileSync('./data/cities.json', JSON.stringify(updatedData, null, 2));
                    console.log('Data appended to ./data/cities.json');
                } else {
                    fs.writeFileSync('./data/cities.json', JSON.stringify(newData, null, 2));
                    console.log('File created and data added to ./data/cities.json');
                }
            } else {
                console.error('No data found in the API response.');
            }

            OFFSET += 100;
        }
    } catch (err) {
        console.error(err);
    }
};

fetchData();