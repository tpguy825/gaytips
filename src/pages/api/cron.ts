import { readFileSync } from "fs";
import { createTransport } from "nodemailer";
import { openpgpEncrypt } from "nodemailer-openpgp";
import type { NextApiRequest, NextApiResponse } from "next";

const sites  = [
	"https://www.tpguy825.cf",
	"https://tpguy825.cf",
	"https://jsab.tpguy825.cf",
	"https://aylshamgeeks.tpguy825.cf",
	"https://bazaar.tpguy825.cf",
	"https://other.tpguy825.cf",
	"https://gaytips.tpguy825.cf",
	"https://old.tpguy825.cf",
] satisfies (`https://${"" | `${string}.`}tpguy825.cf`)[]

export default function handler(_req: NextApiRequest, _res: NextApiResponse) {
	sites.forEach((url) => {
		fetch(url).then((r) => {
			if (!r.ok) {
				sendErrorEmail(url, r, "main")
			}
		}).catch((e) => {
			sendErrorEmail(url, e as Error, "error")
		});
	})
}

const mail = createTransport({
	host: "smtp-relay.sendinblue.com",
	port: 465,
	secure: true, // use TLS
	auth: {
		user: process.env.SENDINBLUE_USER,
		pass: process.env.SENDINBLUE_PASS,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

mail.use("stream", openpgpEncrypt());

export function sendErrorEmail(url: `https://${"" | `${string}.`}tpguy825.cf`, res: Response | Error, type: "main" | "error") {
	void mail.sendMail(
		{
			from: process.env.SENDINBLUE_FROM,
			to: process.env.SENDINBLUE_TO,
			subject: "Error during cron job run for " + url,
			text: [
				"An error occurred during the cron job run for " + url,
				"",
				"Error: " + (res instanceof Error ? res.message : String(res.status) + " " + res.statusText),
				"Type: " + type === "main" ? "Website issue" : "Error sending request",
				"Datetime: " + new Date().toISOString(),
			].join("\n"),
			// @ts-expect-error this is for nodemailer-openpgp
			encryptionKeys: [readFileSync("./key.asc", "utf-8")],
			shouldSign: true,
		},
		(err, response) => {
			console.error(err || response);
		},
	);
}
