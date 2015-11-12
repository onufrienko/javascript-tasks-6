'use strict';

var moment = require('./moment');
var weekDays = ['ПН', 'ВТ', 'СР'];
var hours = [];
for (var i = 0; i < weekDays.length * 24; i++) {
    hours.push(1);
}

module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var gangBand = JSON.parse(json);
    getIntervals(json);
    var workHourFrom = toUTC(readTime(workingHours.from));
    var workHourTo = toUTC(readTime(workingHours.to));
    appropriateMoment.timezone = readTime(workingHours.from).timeZone;
    for (var i = 0; i < weekDays.length; i++) {
        var index = findMoment(minDuration, workHourFrom + i * 24, workHourTo + i * 24);
        if (index != -1) {
            appropriateMoment.date = getDate(index, weekDays[i], appropriateMoment.timezone);
            return appropriateMoment;
        }
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
    var hour = index % 24;
    hour = hour - (-1) * timeZone;
    hour = hour < 10 ? '0' + hour : hour;
    var minutes = hours[index] === 1 ? '00' : hours[index] * 60;
    return day + ' ' + hour + ':' + minutes + timeZone;
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
    var hoursUTC = {'ПН': hourUTC, 'ВТ': hourUTC + 24, 'СР': hourUTC + 48};
    return hoursUTC[day];
}

function readTime(time) {
    var hourRegExp = /([0-9]{2}:[0-9]{2})/;
    var zoneRegExp = /([+-][0-9]+)/;
    var res = {
        day: time.split(' ')[0],
        time: time.match(hourRegExp)[0],
        timeZone: time.match(zoneRegExp)[0]
    };
    return res;
}

function toUTC(date) {
    var hour = date.time.split(':')[0];
    var zone = date.timeZone;
    if (Number(hour) < zone) {
        return Number(hour) - zone + 24;
    }
    return hour - zone;
}

function getNextDay(day) {
    return weekDays[(weekDays.indexOf(day) + 1) % weekDays.length];
}
