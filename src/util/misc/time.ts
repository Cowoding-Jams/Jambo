export function msToReadable(milliseconds: number, short = false): string {
	milliseconds /= 1000 * 60; // relative time in minutes
	const _months = Math.floor(milliseconds / (60 * 24 * 30));
	milliseconds = milliseconds % (60 * 24 * 30);
	const _days = Math.floor(milliseconds / (60 * 24));
	milliseconds = milliseconds % (60 * 24);
	const _hours = Math.floor(milliseconds / 60);
	milliseconds = milliseconds % 60;
	const _minutes = Math.floor(milliseconds);
	milliseconds = milliseconds % 1;
	const _seconds = Math.floor(milliseconds * 60);

	if (short) {
		return `${_months == 0 ? "" : `${_months}mon`}${_days == 0 ? "" : ` ${_days}d`}${
			_hours == 0 ? "" : ` ${_hours}h`
		}${_minutes == 0 ? "" : ` ${_minutes}m`}${_seconds == 0 ? "" : ` ${_seconds}s`}`;
	} else {
		return `${_months == 0 ? "" : `${_months} months`}${_days == 0 ? "" : ` ${_days} days`}${
			_hours == 0 ? "" : ` ${_hours} hours`
		}${_minutes == 0 ? "" : ` ${_minutes} minutes`}${_seconds == 0 ? "" : ` ${_seconds} seconds`}`;
	}
}

export const longDateTimeFormat = "dd.MM.yyyy HH:mm:ss 'UTC'Z";
export const shortDateTimeFormat = "dd.MM.yyyy HH:mm 'UTC'Z";
export const longTimeFormat = "HH:mm:ss 'UTC'Z";
export const shortTimeFormat = "HH:mm 'UTC'Z";
