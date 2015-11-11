'use strict';

var hourRegExp = /([0-9]{1,2}:[0-9]{2})/;
var secInDay = 60 * 60 * 24;
var secInHour = 60 * 60;

module.exports = function () {
    return {
        date: null,

        timezone: null,

        format: function (pattern) {
            var day = this.date.split(' ')[0];
            var time = this.date.match(hourRegExp)[0];
            var res = pattern.replace('%DD', day);
            res = res.replace('%HH:%MM', getTime(time, this.timezone));
            return res;
        },

        fromMoment: function (moment) {
            var verb = declineWord(2, ['остался', 'осталось', 'осталось']) + ' ';
            var days = '';
            var hours = '';
            var minutes = '';
            var diff = getSec(this.date) - getSec(moment.date);
            var daysCount = parseInt(diff / secInDay);
            if (daysCount >= 1) {
                diff -= daysCount * secInDay;
                verb = declineWord(daysCount, ['остался', 'осталось', 'осталось']) + ' ';
                days = daysCount + ' ';
                days += declineWord(daysCount, ['день', 'дня', 'дней']) + ' ';
            }
            var hoursCount = parseInt(diff / secInHour);
            if (hoursCount >= 1) {
                diff -= hoursCount * secInHour;
                hours = hoursCount + ' ';
                hours += declineWord(hoursCount, ['час', 'часа', 'часов']) + ' ';
            }
            var minutesCount = parseInt(diff / 60);
            if (minutesCount != 0) {
                minutes = minutesCount + ' ';
                minutes += declineWord(minutesCount, ['минута', 'минуты', 'минут']) + ' ';
            }
            return 'До ограбления ' + verb + days + hours + minutes;
        }
    };
};

function getTime(time, timezone) {
    var hour = time.split(':')[0];
    var hourInZone = hour - (-1) * timezone;
    return hourInZone + ':' + time.split(':')[1];
}

function declineWord(number, declinations) {
    var cases = [2, 0, 1, 1, 1, 2];
    return declinations[ (number % 100 > 4 && number % 100 < 20) ?
        2 : cases[ (number % 10 < 5) ? number % 10 : 5] ];
}

function getSec(date) {
    var time = date.match(hourRegExp);
    var data = {
        day: date.split(' ')[0],
        hour: parseInt(time[0].split(':')[0]),
        minutes: parseInt(time[0].split(':')[1])
    };
    var daysPassed = data.day === 'ПН' ? 0 : data.day === 'ВТ' ? 1 : 2;
    return daysPassed * secInDay + data.hour * secInHour + data.minutes * 60;
}
