import { createTransport } from "nodemailer";
import { openpgpEncrypt } from "nodemailer-openpgp";
import type { NextApiRequest, NextApiResponse } from "next";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

type HandlerReturn =
	| "Only POST requests are allowed"
	| "No body provided"
	| `Error sending email: ${string}`
	| "Email sent successfully";

export default function handler(req: NextApiRequest, res: NextApiResponse<HandlerReturn>) {
	if (req.method !== "POST") return res.status(405).send("Only POST requests are allowed");
	if (!req.body) return res.status(400).send("No body provided");

	const {
		url,
		res: response,
		type,
	} = req.body as {
		url: Parameters<typeof sendErrorEmail>[0];
		res: Parameters<typeof sendErrorEmail>[1];
		type: Parameters<typeof sendErrorEmail>[2];
	};

	sendErrorEmail(url, response, type)
		.then(() => {
			return res.status(200).send("Email sent successfully");
		})
		.catch((e) => {
			console.error(e);
			return res.status(500).send(`Error sending email: ${(e as Error).message}`);
		});
}

const pgpkey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

xjMEZD0GYxYJKwYBBAHaRw8BAQdA4h3mFU7ilRaFCKxv0919eZmWb0FimY18
xuswGXjrBtvNJ3RwZ3V5ODI1QHByb3Rvbi5tZSA8dHBndXk4MjVAcHJvdG9u
Lm1lPsKMBBAWCgA+BYJkPQZjBAsJBwgJkLFU3KwMrp0RAxUICgQWAAIBAhkB
ApsDAh4BFiEEm3jL/euVTgjlEVwmsVTcrAyunREAAPvzAP445sn4Ti3jniJY
phfYOHQ1F0unTDelSaR+OIUUSeNZcgEA+gHUSZ2LELP6Q4mJWel6g+ce2TgQ
xJAsVHputTc8MAfOOARkPQZjEgorBgEEAZdVAQUBAQdAIN8g+I9vLiGRQgbS
99ER9SzZ6oNoK7jPkBAK+RAdYngDAQgHwngEGBYIACoFgmQ9BmMJkLFU3KwM
rp0RApsMFiEEm3jL/euVTgjlEVwmsVTcrAyunREAAG+DAP4wJ9sudOj7odLH
aWY9YS/ATuvF/53q2SkHZCn+w559QgEAsn2jE2jKFvL7B/bbEiabC9yPjUIE
W/SS30dOAhZQ4Q4=
=rcxl
-----END PGP PUBLIC KEY BLOCK-----`;

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

export const sendErrorEmail: SendErrorEmail<SMTPTransport.SentMessageInfo> = (url, res, type) => {
	return mail.sendMail({
		from: process.env.SENDINBLUE_FROM,
		to: process.env.SENDINBLUE_TO,
		subject: "Error during cron job run for " + url,
		text: `An error occurred during the cron job run for ${url}

Error: ${"message" in res ? res.message : String(res.status) + " " + res.statusText}
Type: ${type === "main" ? "Website issue" : "Error sending request"}
Time: ${new Date().toUTCString()}`,
		// @ts-expect-error this is for nodemailer-openpgp
		encryptionKeys: [pgpkey],
		shouldSign: true,
	});
};

export interface SendErrorEmail<T> {
	(
		url: `http${"" | "s"}://${string}`,
		res: {
			message: string;
		},
		type: "error",
	): Promise<T>;
	(
		url: `http${"" | "s"}://${string}`,
		res: {
			status: number;
			statusText: string;
		},
		type: "main",
	): Promise<T>;
}
