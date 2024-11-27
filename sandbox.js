function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

let col = 'A';
let row = 1;
for (let j = 1; j <= 72; j++) {
    if (j % 12 === 1 && j != 1) {
        col = nextChar(col);
        row = 1;
    }

    const seatNumber = col + row;
    row++;
    console.log(seatNumber);
}