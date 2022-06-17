// Modified from https://github.com/chartjs/chartjs-adapter-dayjs/blob/master/src/index.js
import { _adapters } from 'chart.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

if (!dayjs.prototype.utc) {
    dayjs.extend(utc)
}

const FORMATS = {
    datetime: 'MMM D, YYYY, h:mm:ss a',
    millisecond: 'h:mm:ss.SSS a',
    second: 'h:mm:ss a',
    minute: 'h:mm a',
    hour: 'hA',
    day: 'MMM D',
    week: 'll',
    month: 'MMM YYYY',
    quarter: '[Q]Q - YYYY',
    year: 'YYYY'
}

_adapters._date.override({
    _id: 'dayjs', // DEBUG ONLY

    formats: function () {
        return FORMATS
    },

    parse: function (value, format) {
        if (typeof value === 'string' && typeof format === 'string') {
            value = dayjs.utc(value, format)
        } else if (!(value instanceof dayjs)) {
            value = dayjs.utc(value)
        }
        return value.isValid() ? value.valueOf() : null
    },

    format: function (time, format) {
        return dayjs.utc(time).format(format)
    },

    add: function (time, amount, unit) {
        return dayjs.utc(time).add(amount, unit).valueOf()
    },

    diff: function (max, min, unit) {
        return dayjs.utc(max).diff(dayjs.utc(min), unit)
    },

    startOf: function (time, unit, weekday) {
        time = dayjs.utc(time)
        if (unit === 'isoWeek') {
            weekday = Math.trunc(Math.min(Math.max(0, weekday), 6))
            return time.isoWeekday(weekday).startOf('day').valueOf()
        }
        return time.startOf(unit).valueOf()
    },

    endOf: function (time, unit) {
        return dayjs.utc(time).endOf(unit).valueOf()
    }
})
