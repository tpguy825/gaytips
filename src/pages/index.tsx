import type { StaticImageData } from "next/image";
import Head from "next/head";
import { compiler } from "markdown-to-jsx";
import favicon from "public/favicon.svg";
import styles from "./index.module.css";
import {
	type ComponentClass,
	type FunctionComponent,
	type ReactNode,
	createElement as reactCreateElement,
} from "react";
import gaytips from "public/gaytips.md";

export default function Home() {
	function isString<T>(value: T): value is T extends string ? T : never {
		return typeof value === "string";
	}

	function toId(str: string) {
		return str
			.split(" ")
			.map((e) => {
				return e.toLowerCase();
			})
			.join("-");
	}

	function createElement(
		type: string | FunctionComponent | ComponentClass,
		elementProps: JSX.IntrinsicAttributes,
		...children: ReactNode[]
	) {
		const props = elementProps as typeof elementProps & { id?: string };
		const headingTypes = ["h1", "h2", "h3", "h4", "h5", "h6"];
		const isH = isString(type) && type.startsWith("h") && headingTypes.includes(type);
		if (isH && props.id !== undefined) {
			return (
				<a href={`#${props.id}`} key={props.key}>
					{reactCreateElement(type, { ...props, key: undefined }, ...children)}
				</a>
			);
		}
		return reactCreateElement(type, props, ...children);
	}

	return (
		<>
			<Head>
				<title>gay tips (totally from professionals)</title>
				<meta name="description" content="This website is a joke" />
				<link rel="icon" href={(favicon as StaticImageData).src} />
			</Head>
			<main className={styles.main}>
				<div className={styles.container}>{compiler(gaytips, { createElement })}</div>
			</main>
		</>
	);
}

