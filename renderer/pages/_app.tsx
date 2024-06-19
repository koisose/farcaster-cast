// import React from 'react';
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { PrivyProvider } from '@privy-io/react-auth'
function MyApp({ Component, pageProps }: AppProps) {
  return (
		<PrivyProvider
			appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
			config={{
				loginMethods: ['farcaster'],
				embeddedWallets: {
					createOnLogin: 'all-users',
				},
			}}
		>
			<Component {...pageProps} />
		</PrivyProvider>
	)
}

export default MyApp;
