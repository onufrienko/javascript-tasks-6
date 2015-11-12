'use strict';

var hourRegExp = /([0-9]{2}:[0-9]{2})/;
var zoneRegExp = /([+-][0-9]+)/;
var secInDay = 60 * 60 * 24;
var secInHour = 60 * 60;

module.exports = function () {
    return {
        set date(dateStr) {
            this.day = dateStr.split(' ')[0];
            this.timezone = dateStr.match(zoneRegExp)[0];
            this.time = getTimeInUTC(dateStr.match(hourRegExp)[0], this.timezone);
            this._date = getSec(this.day, this.time);
        },

        get date () {
            return this._date;
        },

        _date: null,

        day: null,

        time: null,

        timezone: null,

        format: function (pattern) {
            var res = pattern.replace('%DD', this.day);
            res = res.replace('%HH:%MM', getTime(this.time, this.timezone));
            return res;
        },

        fromMoment: function (moment) {
            var verb = declineWord(2, ['остался', 'осталось', 'осталось']) + ' ';
            var days = '';
            var hours = '';
            var minutes = '';
            var diff = getSec(this.day, this.time) - getSec(moment.day, moment.time);
            if (diff <= 0) {
                return 'Ограбление уже идёт';
            }
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
    if (hourInZone < 0) {
        hourInZone += 24;
    }
    hourInZone = hourInZone < 10 ? '0' + hourInZone : hourInZone;
    return hourInZone + ':' + time.split(':')[1];
}

function declineWord(number, declinations) {
    var cases = [2, 0, 1, 1, 1, 2];
    return declinations[ (number % 100 > 4 && number % 100 < 20) ?
        2 : cases[ (number % 10 < 5) ? number % 10 : 5] ];
}

function getSec(day, time) {
    var minutes = parseInt(time.split(':')[1]);
    var hour = parseInt(time.split(':')[0]);
    var daysPassed = day === 'ПН' ? 0 : day === 'ВТ' ? 1 : 2;
    return daysPassed * secInDay + hour * secInHour + minutes * 60;
}

function getTimeInUTC(time, zone) {
    var hour = time.split(':')[0];
    if (parseInt(hour) < zone) {
        hour = parseInt(hour) - zone + 24;
        var weekDays = ['ПН', 'ВТ', 'СР'];
        day = weekDays[(weekDays.indexOf(day) + 1) % weekDays.length];
    } else {
        hour -= zone;
    }
    hour = hour < 10 ? '0' + hour : hour;
    return hour + ':' + time.split(':')[1];
}
