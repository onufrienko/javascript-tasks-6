'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;) 'ПН 16:00'
        date: null,

        // А здесь часовой пояс
        timezone: null,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var day = this.date.split(' ')[0];
            var time = this.date.split(' ')[1];
            var res = pattern.replace('%DD', day);
            res = res.replace('%HH:%MM', time);
            return res;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
        }
    };
};
