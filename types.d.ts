declare module "nodemailer-openpgp" {
	import type Mail from "nodemailer/lib/mailer";
	const plugin: () => Mail.PluginFunction;
	export { plugin as openpgpEncrypt }
}

declare module "*.md" {
	const content: string;
	export default content;
}
