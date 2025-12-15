import { Faculty } from "../models/User";

export const timetableConfig = {
	[Faculty.ФМиИТ]: {
		keywords: ["занятий"],
		linkKeywords: ["фмиит"],
		url: "https://www.vsu.by/universitet/fakultety/matematiki-i-it/raspisanie.html",
		multiple: false,
	},
	[Faculty.ПФ]: {
		keywords: ["занятий"],
		linkKeywords: ["пф"],
		url: "https://vsu.by/universitet/fakultety/pedagogicheskij-fakultet/raspisanie.html",
		multiple: true,
	},
	[Faculty.ФГЗиК]: {
		keywords: ["занятий"],
		linkKeywords: ["фгзик"],
		url: "https://vsu.by/universitet/fakultety/fakultet-gumanitarnogo-znaniya-i-kommunikacij/raspisanie.html",
		multiple: true,
	},
	[Faculty.ФСПиП]: {
		keywords: ["занятий"],
		linkKeywords: ["фспип"],
		url: "https://vsu.by/universitet/fakultety/sotsialnoj-pedagogiki-i-psikhologii/raspisanie.html",
		multiple: false,
	},
	[Faculty.ФФКиС]: {
		keywords: ["занятий"],
		linkKeywords: ["ффкис"],
		url: "https://vsu.by/universitet/fakultety/fizicheskoj-kultury-i-sporta/raspisanie.html",
		multiple: false,
	},
	[Faculty.ФХБиГН]: {
		keywords: ["занятий"],
		linkKeywords: ["фхбигн"],
		url: "https://vsu.by/universitet/fakultety/biologicheskij/raspisanie.html",
		multiple: false,
	},
	[Faculty.ХГФ]: {
		keywords: ["занятий"],
		linkKeywords: ["хгф"],
		url: "https://vsu.by/universitet/fakultety/khudozhestvenno-graficheskij/raspisanie.html",
		multiple: true,
	},
	[Faculty.ЮФ]: {
		keywords: ["занятий"],
		linkKeywords: ["юф"],
		url: "https://vsu.by/universitet/fakultety/yuridicheskij/raspisanie.html",
		multiple: false,
	},
};
