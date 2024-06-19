import { useLogin, usePrivy } from '@privy-io/react-auth'
import Head from 'next/head'
import { useRouter } from 'next/router'

const Index = () => {
	const router = useRouter()
	const { ready, authenticated} = usePrivy()
	const { login } = useLogin({
		onComplete(user, isNewUser, wasPreviouslyAuthenticated) {
			console.log('🔑 ✅ Login success', {
				user,
				isNewUser,
				wasPreviouslyAuthenticated,
			})
			router.push('/farcaster')
		},
		onError(error) {
			console.log('🔑 🚨 Login error', { error })
		},
	})

	return (
		<>
			<Head>
				<title>Farcaster Casting Only</title>
				<link rel="icon" href="/images/icon.png" />
			</Head>
			<main>
				
				<div className='flex h-screen w-screen flex-col items-center justify-center'>
					<img
					
						src="/images/icon.png" // Path to your image file
						alt="farcaster icon"
						width={100} // Desired width
						height={100} // Desired height
					/>
					<h2 className='my-4 text-xl font-semibold text-gray-800'>
						Farcaster Casting Only
					</h2>
					<h2 className='my-4 text-md text-gray-800'>
						You can login with and write to Farcaster using Privy.
					</h2>
					<div className='mt-2 w-1/2'>
						<button
							className='my-4 w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:bg-indigo-400'
							onClick={login}
							disabled={!ready || authenticated}
						>
							Login
						</button>
					</div>
				</div>
			</main>
		</>
	)
}

export default Index