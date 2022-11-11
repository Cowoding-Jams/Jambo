export function isLeapYear(year:number) {
    return (((year % 4 == 0) &&
             (year % 100 != 0)) ||
             (year % 400 == 0));
}

export function isValidDay(month:number, day:number): boolean {
    if (month == 2) {
        return day <= 29
    }

    if (month == 4 || month == 6 ||
        month == 9 || month == 11)
        return (day <= 30);
    return true

}