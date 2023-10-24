// Copyright _!_
//
// License _!_

// dayjs is Arc's chosen date library. If you import this module
// you must install dayjs.

import dayjs, { ManipulateType } from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import { DateRange, EarningsPeriod } from "./api.types";

if (!dayjs.prototype.utc) {
  dayjs.extend(utc);
}
if (!dayjs.prototype.duration) {
  dayjs.extend(duration);
}

export const startOfToday = () => dayjs.utc().startOf("day").toDate();

export const endOfDay = (date: Date) => dayjs.utc(date).endOf("day").toDate();

export function pastDateRange(unit: ManipulateType = "week", count = 1): DateRange {
  const endDateObj = dayjs.utc().startOf("minute");
  const endDate = endDateObj.toDate();
  const startDate = endDateObj.subtract(count, unit).toDate();

  return { startDate, endDate };
}

export const pastWeekDateRange = () => pastDateRange("week");

export const dateToUnixTimestamp = (date: Date) => dayjs.utc(date).unix();

export function timeZone() {
  return new Date().toLocaleTimeString("en-us", { timeZoneName: "short" }).split(" ")[2];
}

/**
 * Expects both dates to be floored to the start of the day,
 * e.g. 0 hours, 0 min, 0 sec, etc.
 */
export function dayIntervalFromDateRange(startDate: Date, endDate: Date) {
  const dateInterval = [];

  let tempDate = dayjs.utc(startDate);
  const endDateObj = dayjs.utc(endDate);

  while (tempDate.toDate().getTime() <= endDateObj.toDate().getTime()) {
    dateInterval.push(tempDate.toDate());
    tempDate = tempDate.add(1, "day");
  }

  return dateInterval;
}

export function getEaringsPeriodOptions(startDate: Date): EarningsPeriod[] {
  const today = new Date();
  const startYear = startDate.getFullYear();
  const endYear = today.getFullYear();
  const options: EarningsPeriod[] = [];

  for (let i = startYear; i <= endYear; i++) {
    const endMonth = i !== endYear ? 11 : today.getMonth();
    const startMonth = i === startYear ? startDate.getMonth() : 0;

    for (let j = startMonth; j <= endMonth; j++) {
      const displayDate = new Date(i, j, 1);

      const monthName = dayjs(displayDate).format("MMMM YYYY");

      options.push({
        month: monthName,
        date: displayDate,
      });
    }
  }

  return options.reverse();
}

export function parseDateRange(dateString: string): {
  startDate: Date;
  endDate: Date;
} | null {
  const customRangeMatch = /^(\d{4})-(\d{2})-(\d{2}) (\d{4})-(\d{2})-(\d{2})$/g.exec(dateString);

  if (!customRangeMatch) {
    return null;
  }

  const startDate = new Date(+customRangeMatch[1], +customRangeMatch[2] - 1, +customRangeMatch[3]);
  const endDate = new Date(+customRangeMatch[4], +customRangeMatch[5] - 1, +customRangeMatch[6]);

  if (startDate > endDate) {
    return null;
  }

  return { startDate, endDate };
}
