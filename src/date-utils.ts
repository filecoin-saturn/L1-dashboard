// Copyright _!_
//
// License _!_

// dayjs is Arc's chosen date library. If you import this module
// you must install dayjs.

import dayjs, { ManipulateType } from 'dayjs'
import utc from 'dayjs/plugin/utc'

if (!dayjs.prototype.utc) {
    dayjs.extend(utc)
}

export const startOfToday = () => dayjs.utc().startOf('day').toDate()

export const endOfDay = (date: Date) => dayjs.utc(date).endOf('day').toDate()

export function pastDateRange (unit: ManipulateType = 'week', count = 1) {
    const endDateObj = dayjs.utc().add(1, 'day').startOf('day')
    const endDate = endDateObj.toDate()
    const startDate = endDateObj.subtract(count, unit).toDate()

    return { startDate, endDate }
}

export const pastWeekDateRange = () => pastDateRange('week')

export const dateToUnixTimestamp = (date: Date) => dayjs.utc(date).unix()

export function timeZone () {
    return new Date()
        .toLocaleTimeString('en-us', { timeZoneName: 'short' })
        .split(' ')[2]
}

/**
 * Expects both dates to be floored to the start of the day,
 * e.g. 0 hours, 0 min, 0 sec, etc.
 */
export function dayIntervalFromDateRange (startDate: Date, endDate: Date) {
    const dateInterval = []

    let tempDate = dayjs.utc(startDate)
    const endDateObj = dayjs.utc(endDate)

    while (tempDate.toDate().getTime() <= endDateObj.toDate().getTime()) {
        dateInterval.push(tempDate.toDate())
        tempDate = tempDate.add(1, 'day')
    }

    return dateInterval
}

export function fillTimeSeriesData (startDate, endDate, data, emptyVal = {}) {
    const filledData = []

    const interval = dayIntervalFromDateRange(startDate, endDate)
    for (let i = 0, j = 0; i < interval.length; i++) {
        const date = interval[i]
        const dataPoint = data[j]

        if (dataPoint && new Date(dataPoint.date).getTime() === date.getTime()) {
            j++
            filledData.push(dataPoint)
        } else {
            filledData.push({ date, ...emptyVal })
        }
    }

    return filledData
}

// dayNum is 0 to 6, 0 = sunday, 6 = saturday
// Example: 2nd friday of the current month is getNthDayOfMonth(5, 2)
export function getNthDayOfMonth (dayNum, nth) {
    let day = dayjs.utc().startOf('month').day(dayNum)

    // Handle case where day(dayNum) pushes the date to the previous month
    if (day.date() > 7) {
        day = day.add(7, 'day')
    }
    day = day.add(nth - 1, 'week')

    return day.toDate()
}
