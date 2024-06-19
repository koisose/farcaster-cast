import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import {
	useLogout
} from '@privy-io/react-auth'
import Head from 'next/head'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


export default function FarcasterPage() {
	const readLocalStorage = (key) => {
		const value = localStorage.getItem(key);
		return value;
	};
	const saveToLocalStorage = (key, value) => {
		localStorage.setItem(key, value);
	};
	
	const router = useRouter()
	const [hubUrl, setHubUrl] = useState('https://hub-api.neynar.com');
	const [neynarApiKey, setNeynarApiKey] = useState("");
	const { logout } = useLogout({
		onSuccess: () => {
			console.log('🫥 ✅ logOut onSuccess')
			saveToLocalStorage("HUB_URL","")
			saveToLocalStorage("NEYNAR_API_KEY","");
			router.push('/')
		},
	})
	useEffect(()=>{
		setHubUrl(readLocalStorage("HUB_URL") || 'https://hub-api.neynar.com')
		setNeynarApiKey(readLocalStorage("NEYNAR_API_KEY"))
	},[])

	return (
		<>
			<Head>
				<title>Farcaster Casting Only</title>
			</Head>

			<main className='flex min-h-screen flex-col bg-privy-light-blue px-4 py-6 sm:px-20 sm:py-10'>
				<ToastContainer />
				<div className='flex flex-row justify-between'>
					<div className='flex items-center'>
						<button
							onClick={() => router.back()}
							className='flex items-center text-violet-700 hover:text-violet-900'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='w-6 h-6 mr-2'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M15.75 19.5L8.25 12l7.5-7.5'
								/>
							</svg>
							Back
						</button>
						<h1 className='ml-4 text-2xl font-semibold'>Setting</h1>
					</div>
					<div className='flex flex-row gap-4'>

						<button
							onClick={logout}
							className='rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900'
						>
							Logout
						</button>
					</div>
				</div>
				<label className='block text-sm font-medium text-gray-700 my-2'>Hub URL</label>
				<input
					type='text'
					className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
					onChange={(e) => setHubUrl(e.target.value)}
					value={hubUrl}
				/>
				<label className='block text-sm font-medium text-gray-700 my-2'>NEYNAR API KEY</label>
				<input type="password" onChange={(e) => setNeynarApiKey(e.target.value)}
					value={neynarApiKey} className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50' />

				<button
					className='rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900 mt-5'
					onClick={()=>{
						saveToLocalStorage("HUB_URL",hubUrl);
						saveToLocalStorage("NEYNAR_API_KEY",neynarApiKey);
						toast("save on localstorage")
					}}
				>
					Save
				</button>
			</main>
		</>
	)
}