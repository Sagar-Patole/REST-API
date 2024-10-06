const fs = require('fs');

const rootDir = require('./path');

exports.formatDateToIST = (date) => {
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }

    const istString = date.toLocaleString('en-IN', options);
    const [datePart, timePart] = istString.split(', ');
    const [day, month, year] = datePart.split('/');
    const formattedDate = `${year}-${month}-${day} ${timePart}`;
    return formattedDate;
}

exports.deleteFile = (filePath) => {
    const absolutefilepath = rootDir + '/' + filePath;
    fs.unlink(absolutefilepath, error => console.log(error));
}