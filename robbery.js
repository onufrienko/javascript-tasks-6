'use strict';

var moment = require('./moment');
var hours = [];
for (var i = 0; i < 72; i++) {
    hours.push(1);
}

module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var gangBand = JSON.parse(json);
    getIntervals(json);
    var workHourFrom = toUTC(readTime(workingHours.from));
    var workHourTo = toUTC(readTime(workingHours.to));
    appropriateMoment.timeZone = readTime(workingHours.from).timeZone;
    var monIndex = findMoment(minDuration, workHourFrom, workHourTo);
    if (monIndex != -1) {
        appropriateMoment.date = getDate(monIndex, 'ПН', appropriateMoment.timeZone);
        return appropriateMoment;
    }
    var tueIndex = findMoment(minDuration, workHourFrom + 24, workHourTo + 24);
    if (tueIndex != -1) {
        appropriateMoment.date = getDate(tueIndex, 'ВТ', appropriateMoment.timeZone);
        return appropriateMoment;
    }
    var wedIndex = findMoment(minDuration, workHourFrom + 48, workHourTo + 48);
    if (wedIndex != -1) {
        appropriateMoment.date = getDate(wedIndex, 'СР', appropriateMoment.timeZone);
        return appropriateMoment;
    }
    return appropriateMoment;
};

module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        return robberyMoment.fromMoment(moment);
    }
    return 'Ограбление уже идёт!';
};

function getDate(index, day, timeZone) {
    var hour = getCorrectHour(index, timeZone);
    var minutes = hours[index] === 1 ? '00' : hours[index] * 60;
    return day + ' ' + hour + ':' + minutes;
}

function getCorrectHour(index, timeZone) {
    while (index > 23) {
        index = Math.abs(24 - index);
    }
    var str = index + ':00';
    var hour = str.split(':')[0];
    return hour - (-1) * timeZone;
}

function findMoment(minDuration, from, to) {
    for (var i = from; i < to; i++) {
        var foundFreeHours = 0;
        var index = i;
        while (true) {
            if (i >= to || hours[i] === 0) {
                break;
            } else {
                foundFreeHours += hours[i] * 60;
                i++;
                if (foundFreeHours >= minDuration) {
                    return index;
                }
            }
        }
    }
    return -1;
}

function getIntervals(json) {
    var robbers = JSON.parse(json);
    Object.keys(robbers).forEach(function (robber) {
        robbers[robber].forEach(function (busyTime) {
            var fromHour = getHour(busyTime.from);
            var toHour = getHour(busyTime.to);
            for (var i = fromHour; i < toHour; i++) {
                hours[i] = 0;
            }
            considerMinutes(busyTime.from, fromHour);
            considerMinutes(busyTime.to, toHour);
        });
    });
}

function considerMinutes(time, index) {
    var minutesRegExp = /(:{1}[0-9]{2})/;
    var minutes = parseInt(time.match(minutesRegExp)[0].split(':')[1]);
    if (minutes != 0) {
        hours[index] = minutes / 60;
    }
}

function getHour(time) {
    var date = readTime(time);
    var hourUTC = toUTC(date);
    var day = date.day;
    while (hourUTC > 23) {
        day = getNextDay(day);
        hourUTC = Math.abs(24 - hourUTC);
    }
    switch (day) {
        case 'ПН':
            return hourUTC;
        case 'ВТ':
            return hourUTC + 24;
        case 'СР':
            return hourUTC + 48;
    }
}

function readTime(time) {
    var hourRegExp = /([0-9]{2}:[0-9]{2})/;
    var zoneRegExp = /((\+{1}|\-{1})[0-9]+)/;
    var res = {
        day: time.split(' ')[0],
        hour: time.match(hourRegExp)[0],
        timeZone: time.match(zoneRegExp)[0]
    };
    return res;
}

function toUTC(date) {
    var hour = date.hour.split(':')[0];
    var zone = date.timeZone;
    return hour - zone;
}

function getNextDay(day) {
    var dayNumDict = { 'ПН': 0, 'ВТ': 1, 'СР': 2 };
    var NumDayDict = ['ПН', 'ВТ', 'СР'];
    return NumDayDict[dayNumDict[day] + 1];
}
