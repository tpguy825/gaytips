import type { NextApiRequest, NextApiResponse } from "next";
import { sendErrorEmail } from "~/errorEmail";

const sites: `http${"" | "s"}://${string}`[] = [
	"https://www.tpguy825.cf",
	"https://tpguy825.cf",
	"https://jsab.tpguy825.cf",
	"https://aylshamgeeks.tpguy825.cf",
	"https://bazaar.tpguy825.cf",
	"https://other.tpguy825.cf",
	"https://gaytips.tpguy825.cf",
	"https://old.tpguy825.cf",
	// "https://thisdoesnotexist.tpguy825.cf",  // for testing
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	Promise.all<Promise<boolean>[]>(
		sites.map(async (url) => {
			try {
				const r = await fetch(url);
				if (!r.ok) {
					await sendErrorEmail(url, {
						status: r.status,
						statusText: r.statusText,
					}, "main");
				}

				return r.ok;
			} catch (e) {
				const error = e as Error;
				await sendErrorEmail(
					url,
					{
						message: "message" in error ? error.message : "Unknown error, check Vercel logs",
					},
					"error",
				);
				return false;
			}
		}),
	)
		.then(res.json)
		.catch((e) => {
			console.error(e);
			res.status(500).json(e);
		});
}

// const sendErrorEmail: SendErrorEmail<Response> = async (url, res, type) => {
// 	return await fetch(errorUrl, {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 		body: JSON.stringify({
// 			url,
// 			res,
// 			type,
// 		}),
// 	});
// };
