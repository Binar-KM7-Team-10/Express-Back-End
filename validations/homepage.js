const HttpRequestError = require("../utils/error")

module.exports = {
    queryParams: (data) => {
        const { page, continent } = data;

        if (page || page === '') {    
            if (isNaN(page)) {
                throw new HttpRequestError('page tidak valid. Pastikan page berupa angka.', 400);
            }

            if (page <= 0) {
                throw new HttpRequestError('page tidak valid. Pastikan page bernilai lebih dari satu (1).', 400);
            }
        }

        if (continent || continent === '') {
            const continentOptions = ['All', 'Asia', 'Africa', 'America', 'Europe', 'Australia'];

            if (!continentOptions.includes(continent)) {
                throw new HttpRequestError('Validasi gagal. Pastikan continent memiliki nilai \'All\', \'Asia\', \'Africa\', \'America\', \'Europe\', atau \'Australia\'.', 400);
            }
        }
    }
};