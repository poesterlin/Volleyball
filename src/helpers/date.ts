import {
	isAfter,
	isSameDay,
	differenceInCalendarISOWeeks,
	differenceInYears,
	differenceInCalendarDays,
	isBefore,
	compareAsc
} from 'date-fns';

export function addDays(date, days) {
	const copy = new Date(Number(date));
	copy.setDate(date.getDate() + days);
	return copy;
}

export function humanReadableDate(date: Date | string) {
	if (!date) {
		return "no date"
	}
	const comp = new Date(date);
	const today = new Date();
	if (isSameDay(comp, today)) {
		return 'today';
	}
	const days = differenceInCalendarDays(comp, today);

	if (days === 1) {
		return 'tomorrow';
	}
	if (days === -1) {
		return 'yesterday';
	}
	const weekday = Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(comp);

	if (Math.abs(days) < 4) {
		let modifier = '';
		if (isAfter(today, comp)) {
			modifier = 'vor';
		} else {
			modifier = 'in';
		}
		return `${weekday}, ${modifier} ${Math.abs(days)} days`;
	}

	const weeks = differenceInCalendarISOWeeks(comp, today);

	if (weeks === 0) {
		let modifier = '';
		if (isAfter(today, comp)) {
			modifier = 'last';
		} else {
			modifier = 'on';
		}
		return `${modifier} ${weekday}`;
	}

	if (weeks === -1) {
		return 'last week on ' + weekday;
	}
	if (weeks === 1) {
		return 'next week on ' + weekday;
	}
	if (Math.abs(weeks) < 4) {
		let modifier = '';
		if (isAfter(today, comp)) {
			modifier = 'vor';
		} else {
			modifier = 'in';
		}
		const day = comp.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
		return `${modifier} ${Math.abs(weeks)} weeks (${day})`;
	}

	return comp.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export function isOnDate(d1: Date | string, d2: Date | string): boolean {
	return isSameDay(new Date(d1), new Date(d2));
}

export function sort(d1: any, d2: any) {
	return compareAsc(new Date(d1.date), new Date(d2.date));
}

export function daysDifference(day1, day2) {
	return Math.ceil((day1 - day2) / (1000 * 60 * 60 * 24));
}

export function getDayThisYear(birthDate, year = new Date().getFullYear()) {
	birthDate = new Date(birthDate);
	return new Date(year, birthDate.getMonth(), birthDate.getDate());
}

export function getAge(birthDate: Date) {
	const year = new Date().getFullYear();
	const dayDate = addDays(getDayThisYear(birthDate), 1);
	if (isBefore(dayDate, new Date())) {
		dayDate.setFullYear(year + 1);
	}
	return differenceInYears(dayDate, birthDate);
}



export const daysOfWeek = [
	['Sonntag', 'So'],
	['Montag', 'Mo'],
	['Dienstag', 'Di'],
	['Mittwoch', 'Mi'],
	['Donnerstag', 'Do'],
	['Freitag', 'Fr'],
	['Samstag', 'Sa']
];

export const monthsOfYear = [
	['Januar', 'Jan'],
	['Februar', 'Feb'],
	['M??rz', 'Mar'],
	['April', 'Apr'],
	['Mai', 'Mai'],
	['Juni', 'Jun'],
	['Juli', 'Jul'],
	['August', 'Aug'],
	['September', 'Sep'],
	['Oktober', 'Okt'],
	['November', 'Nov'],
	['Dezember', 'Dez']
];