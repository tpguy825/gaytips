import type { NextComponentType, NextPageContext } from "next/types";
import type { BaseContext } from "next/dist/shared/lib/utils";
import { Analytics } from "@vercel/analytics/react";

import "~/styles/globals.css";

export default function App<
	Context extends BaseContext = NextPageContext,
	InitialProps = object,
	Props extends JSX.IntrinsicAttributes = object,
>({ Component, pageProps }: { Component: NextComponentType<Context, InitialProps, Props>; pageProps: Props }) {
	return (
		<>
			<Component {...pageProps} />
			<Analytics />
		</>
	);
}

