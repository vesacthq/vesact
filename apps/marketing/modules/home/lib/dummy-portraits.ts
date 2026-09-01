const mayaChen = "/images/testimonials/maya-chen.webp";
const jonasWeber = "/images/testimonials/jonas-weber.webp";
const ameliaOrtiz = "/images/testimonials/amelia-ortiz.webp";

export const dummyPortraits = {
	item1: mayaChen,
	item2: jonasWeber,
	item3: ameliaOrtiz,
} as const satisfies Record<string, string>;

export const dummyTeamPortraits = [mayaChen, jonasWeber, ameliaOrtiz] as const;
