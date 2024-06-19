import { useRouter } from 'next/router'
import React, { useState,useEffect } from 'react'
import {
	useLogout,
	usePrivy,
	useExperimentalFarcasterSigner,
	FarcasterWithMetadata,
} from '@privy-io/react-auth'
import Head from 'next/head'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
	ExternalEd25519Signer,
	HubRestAPIClient,
} from '@standard-crypto/farcaster-js'
import axios from 'axios'
import { parseString } from '../utils/parseString'




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
	async function openInBrowser(url: string) {
		toast("opening in your browser please wait...", { autoClose: 1000 })
		require("electron").shell.openExternal(url);

	}
	useEffect(()=>{
		setHubUrl(readLocalStorage("HUB_URL") || 'https://hub-api.neynar.com')
		setNeynarApiKey(readLocalStorage("NEYNAR_API_KEY"))
	},[])
	const [castInput, setCastInput] = useState('');
	const [channelList, setChannelList] = useState([]);
	const [hashList, setHashList] = useState([]);
	const [channelToSendTo, setChannelToSendTo] = useState("");
	const [hashToSendTo, setHashToSendTo] = useState("");
	const [loading, setLoading] = useState(false);
	const [sendToHome, setSendToHome] = useState(false);
	const [loadCast, setLoadCast] = useState(false);
	const [feed, setFeed] = useState([]);
	const [cursor, setCursor] = useState("");
	const [preview, setPreview] = useState({
		originalText: "",
		text: "",
		embeds: [],
		embedsDeprecated: [],
		mentions: [],
		mentionsUsername: [],
		mentionsPositions: []
	});
	const [isPreview, setIsPreview] = useState(false);
	const { user } = usePrivy()

	const {
		getFarcasterSignerPublicKey,
		signFarcasterMessage,
		requestFarcasterSignerFromWarpcast,
	} = useExperimentalFarcasterSigner()

	const privySigner = new ExternalEd25519Signer(
		signFarcasterMessage,
		getFarcasterSignerPublicKey
	)
	const hubClient = new HubRestAPIClient({
		hubUrl,
		axiosInstance: axios.create({
			headers: { api_key: neynarApiKey },
		}),
	})

	const { logout } = useLogout({
		onSuccess: () => {
			saveToLocalStorage("HUB_URL","")
			saveToLocalStorage("NEYNAR_API_KEY","");
			console.log('🫥 ✅ logOut onSuccess')
			router.push('/')
		},
	})

	const farcasterAccount = user?.linkedAccounts.find(
		(a) => a.type === 'farcaster'
	) as FarcasterWithMetadata
	const signerPublicKey = farcasterAccount?.signerPublicKey

	async function getUsername(fid: string) {
		const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
		const options = {
			method: 'GET',
			headers: { accept: 'application/json', api_key: neynarApiKey }
		};


		const response = await fetch(url, options);
		const json = await response.json();
		return json.users[0].username;

	}
	async function getChannel(parentUrl: string) {
		try {
			const url = `https://api.neynar.com/v2/farcaster/channel?id=${encodeURIComponent(parentUrl)}&type=parent_url`;
			const options = {
				method: 'GET',
				headers: { accept: 'application/json', api_key: neynarApiKey }
			};


			const response = await fetch(url, options);
			const json = await response.json();

			return { id: json.channel.id, url: json.channel.url };
		} catch (e) {
			throw new Error("channel not found")
		}


	}
	async function getChannelById(id: string) {
		try {
			const url = `https://api.neynar.com/v2/farcaster/channel?id=${id}`;
			const options = {
				method: 'GET',
				headers: { accept: 'application/json', api_key: neynarApiKey }
			};


			const response = await fetch(url, options);
			const json = await response.json();

			return { id: json.channel.id, url: json.channel.url };
		} catch (e) {
			throw new Error("channel not found")
		}


	}
	async function getWarpcastUrl(warpcastUrl: string) {
		try {
			const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${encodeURIComponent(warpcastUrl)}&type=url`;
			const options = {
				method: 'GET',
				headers: { accept: 'application/json', api_key: neynarApiKey }
			};


			const response = await fetch(url, options);
			const json = await response.json();

			return { url: warpcastUrl, hash: json.cast.hash, username: json.cast.author.username, fid: json.cast.author.fid };
		} catch (e) {
			throw new Error("warpcast url not found")
		}


	}
	async function getFeed(cursor: string = "") {
		try {

			const url = `https://api.neynar.com/v2/farcaster/feed?feed_type=filter&fids=${farcasterAccount.fid}&with_recasts=false&limit=1${cursor}`;
			const options = {
				method: 'GET',
				headers: { accept: 'application/json', api_key: neynarApiKey }
			};


			const response = await fetch(url, options);
			const json = await response.json();

			return json

		} catch (e) {

			throw new Error("can't get feed")
		}

	}
	async function addChannel(id: string) {
		try {
			setLoading(true)
			const channel = await getChannelById(id)
			if (channelList.some(item => item.id === channel.id)) {
				throw new Error("channel id already added");
			}
			setChannelList(channelList.concat(channel))
			setChannelToSendTo("")
			setLoading(false)
		} catch (e) {
			setLoading(false)
			toast.error(e.message)
		}
	}
	async function addWarpcastURL(warpcastUrl: string) {
		try {
			setLoading(true)
			const warpcastUrlList = await getWarpcastUrl(warpcastUrl)
			if (hashList.some(item => item.hash === warpcastUrlList.hash)) {
				throw new Error("warpcast url already added");
			}
			setHashList(hashList.concat(warpcastUrlList))
			setHashToSendTo("")
			setLoading(false)
		} catch (e) {
			setLoading(false)
			toast.error(e.message)
		}
	}

	function fetchUsernameAndOpenInBrowser(fid: string, parentHash: string) {
		getUsername(fid).then(authorUsername => openInBrowser(`https://warpcast.com/${authorUsername}/${parentHash}`))
	}
	function fetchChannelAndOpenInBrowser(rootParentUrl: string) {
		getChannel(rootParentUrl).then(({ id }) => { openInBrowser(`https://warpcast.com/~/channel/${id}`); })
	}

	const formattedCasts = feed.map((cast: any) => {

		return (
			<div className='mt-4 rounded-md border bg-slate-100 p-4' key={cast.hash}>
				<p className='my-2 text-sm text-gray-600 cursor-pointer'>
					Hash:<span onClick={() => openInBrowser(`https://warpcast.com/${farcasterAccount?.username}/${cast.hash.substring(0, 10)}`)} className='hover:underline cursor-pointer'>
						{cast.hash}</span></p>
				<p className='my-2 text-sm text-gray-600'>Text: {cast.text}</p>
				<p className='my-2 text-sm text-gray-600'>Embeds: {cast.embeds.map(({ url, cast_id }) => <span key={Math.random()} className='inline-flex items-center bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded dark:bg-orange-200 dark:text-orange-900'>
					<span className="cursor-pointer" onClick={() => cast_id ? fetchUsernameAndOpenInBrowser(cast_id.fid, cast_id.hash.substring(0, 10)) : openInBrowser(url)}>{cast_id ? cast_id.hash.substring(0, 10) : url}</span>
				</span>)}</p>
				<p className='my-2 text-sm text-gray-600'>
					Parent Hash: <span onClick={async () => cast.parent_hash && fetchUsernameAndOpenInBrowser(cast.author.fid, cast.parent_hash.substring(0, 10))} className='hover:underline cursor-pointer'>
						{cast.parent_hash}</span>
				</p>
				<p className='my-2 text-sm text-gray-600'>
					Timestamp: {new Date(cast.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, weekday: 'long' })}
				</p>
				<p className='my-2 text-sm text-gray-600'>
					Channel: {cast.root_parent_url !== null ?
						<button className='rounded-md bg-violet-600 px-2 py-1 text-xs text-white hover:bg-violet-700'
							onClick={() => fetchChannelAndOpenInBrowser(cast.root_parent_url)}>
							{cast.root_parent_url}</button> : ""}

				</p>


				<button
					className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
					disabled={loading}
					onClick={async () => {
						try {
							if (!confirm("Are you sure you want to delete?")) {
								return;
							}
							setLoading(true)
							const { hash } = await hubClient.removeCast(
								cast.hash,
								farcasterAccount.fid!,
								privySigner
							)
							setFeed([])
							setTimeout(async () => {
								const feeds = await getFeed();
								toast(`Removed cast. Message hash: ${hash}`)
								setFeed(feeds.casts)
								setLoading(false)
								if (feeds.next.cursor) {
									setCursor(`&cursor=${feeds.next.cursor}`)
								} else {
									setCursor("")
								}
							}, 2000)



						} catch {
							setLoading(false)
							toast.error(`Error removing cast`)
						}


					}}
				>
					{loading ? <div className="flex justify-center items-center">
						<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white-600"></div>
					</div> : "Remove Cast"}
				</button>


			</div>
		)
	})

	return (
		<>
			<Head>
				<title>Farcaster Casting Only</title>
			</Head>

			<main className='flex min-h-screen flex-col bg-privy-light-blue px-4 py-6 sm:px-20 sm:py-10'>
				<ToastContainer />
				<div className='flex flex-row justify-between'>
					<h1 className='text-2xl font-semibold'>Farcaster Casting Only</h1>
					<div className='flex flex-row gap-4'>
						<button
							disabled={loading}
							onClick={() => router.push("/setting")}
							className='rounded-md bg-orange-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900'
						>
							Setting
						</button>
						<button
							disabled={loading}
							onClick={logout}
							className='rounded-md bg-violet-200 px-4 py-2 text-sm text-violet-700 hover:text-violet-900'
						>Logout
						</button>
					</div>
				</div>
				<p className='mb-2 mt-6 text-sm font-bold uppercase text-gray-600'>
					Farcaster User
				</p>

				<div className='rounded-md border bg-slate-100 p-4'>
					<p className='my-2 text-sm text-gray-600'>
						Display Name: {farcasterAccount?.displayName}
					</p>
					<p className='my-2 text-sm text-gray-600'>
						Username: {farcasterAccount?.username}
					</p>
					<p className='my-2 text-sm text-gray-600'>
						Farcaster Signer: {signerPublicKey ? signerPublicKey.substring(0, 10) : 'NONE'}
					</p>
				</div>
				<div className='flex flex-wrap gap-4'>
					{!signerPublicKey && (
						<button
							className={`mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 ${neynarApiKey.length === 0  ? "hidden" : ""}`}
							onClick={requestFarcasterSignerFromWarpcast}
							disabled={!!signerPublicKey}
						>
							Request Farcaster Signer from Warpcast
						</button>
					)}
				</div>
				<div className={`flex justify-center mt-4 ${neynarApiKey.length !== 0  ? "hidden" : ""}`}>please put neynar api key on <span className="text-blue-600 cursor-pointer mx-1" onClick={() => router.push("/setting")}>setting</span> to submit cast</div>
				{(neynarApiKey.length !== 0 && signerPublicKey) && <>
					<p className='mb-2 mt-6 text-sm font-bold uppercase text-gray-600'>
						Submit a cast
					</p>
					<div className={`flex flex-wrap`}>
						<div className={`flex flex-col w-full ${isPreview ? "hidden" : ""}`}>
							<textarea
								disabled={loading}
								placeholder='My cast text!'
								className='w-full rounded-md border'
								value={castInput}
								onChange={(e) => setCastInput(e.target.value)}
							></textarea>
							<div className='flex justify-end'>
								<small>{castInput.length}/320</small>
							</div>
						</div>
						<div className={`w-full mb-2 ${isPreview ? "hidden" : ""}`}>
							<label className='block text-sm font-medium text-gray-700'>Channel to send to:</label>
							<div className='flex justify-between'>
								<input
									placeholder='Channel name'
									className='w-full h-8 rounded-md border mr-4'
									value={channelToSendTo}
									onChange={(e) => setChannelToSendTo(e.target.value)}
									disabled={loading}
								/>
								<button disabled={loading} onClick={() => addChannel(channelToSendTo)} className='h-8 rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'>
									{loading ? <div className="flex justify-center items-center">
										<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white-600"></div>
									</div> : "Add"}


								</button>

							</div>
							{channelList.length > 0 && <label className="flex items-center space-x-2">
								<input
									type="checkbox"
									className="h-4 w-4"
									checked={sendToHome}
									onChange={(e) => setSendToHome(e.target.checked)}
								/>
								<span className="text-sm">check this box to also send to home</span>
							</label>}
							{channelList.map((value, index) => <span key={index} className='mt-4 inline-flex items-center bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded dark:bg-orange-200 dark:text-orange-900'>
								<span onClick={() => openInBrowser(`https://warpcast.com/~/channel/${value.id}`)} className='hover:underline cursor-pointer'>/{value.id}</span>
								<button onClick={() => setChannelList(channelList.filter((_, i) => i !== index))} className='ml-1 text-gray-500 hover:text-gray-800 transition duration-300'>
									<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4'>
										<path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
									</svg>
								</button>
							</span>)}

						</div>
						<div className={`w-full mb-2 ${isPreview ? "hidden" : ""}`}>
							<label className='block text-sm font-medium text-gray-700'>Reply to warpcast url:</label>
							<div className='flex justify-between'>
								<input
									disabled={loading}
									placeholder='warpcast url'
									className='w-full h-8 rounded-md border mr-4'
									value={hashToSendTo}
									onChange={(e) => setHashToSendTo(e.target.value)}
								/>
								<button disabled={loading} onClick={() => addWarpcastURL(hashToSendTo)} className='h-8 rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'>
									{loading ? <div className="flex justify-center items-center">
										<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white-600"></div>
									</div> : "Add"}
								</button>
							</div>
							{hashList.map((value, index) => <span key={index} className='mt-4 inline-flex items-center bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded dark:bg-orange-200 dark:text-orange-900'>
								<span onClick={() => openInBrowser(`https://warpcast.com/${value.username}/${value.hash.substring(0, 10)}`)} className='hover:underline cursor-pointer'>{value.hash.substring(0, 10)}</span>
								<button onClick={() => setHashList(hashList.filter((_, i) => i !== index))} className='ml-1 text-gray-500 hover:text-gray-800 transition duration-300'>
									<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-4 h-4'>
										<path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
									</svg>
								</button>
							</span>)}
						</div>
						<div className={`rounded-md border bg-slate-100 p-4 w-full mb-2 ${!isPreview ? "hidden" : ""}`}>
							<p className='my-2 text-sm text-gray-600'>
								text: {preview.originalText}
							</p>
							<p className='mt-1 text-sm text-gray-600'>
								mentioned user:{preview.mentionsUsername.map((value, index) => <span key={index} className='mt-1 mx-1 inline-flex items-center bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded dark:bg-orange-200 dark:text-orange-900'>
									<span onClick={() => openInBrowser(`https://warpcast.com/${value}`)} className='hover:underline cursor-pointer'>{value}</span>
								</span>)}
							</p>
							<p className='mt-1 text-sm text-gray-600'>
								embeds: {preview.embeds.map((value, index) => <span key={index} className='mx-1 mt-1 inline-flex items-center bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded dark:bg-orange-200 dark:text-orange-900'>
									<span onClick={() => openInBrowser(value?.url)} className='hover:underline cursor-pointer'>{value?.url.length > 20 ? value?.url.substring(0, 20) : value?.url}</span>
								</span>)}
							</p>
							<p className='mt-1 text-sm text-gray-600'>
								send to channels: {channelList.map((value, index) => <span key={index} className=' inline-flex items-center bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded dark:bg-orange-200 dark:text-orange-900'>
									<span onClick={() => openInBrowser(`https://warpcast.com/~/channel/${value.id}`)} className='hover:underline cursor-pointer'>/{value.id}</span>

								</span>)}
							</p>
							<p className='my-2 text-sm text-gray-600'>
								reply to hash: {hashList.map((value, index) => <span key={index} className='mt-4 inline-flex items-center bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded dark:bg-orange-200 dark:text-orange-900'>
									<span onClick={() => openInBrowser(`https://warpcast.com/${value.username}/${value.hash.substring(0, 10)}`)} className='hover:underline cursor-pointer'>{value.hash.substring(0, 10)}</span>

								</span>)}
							</p>
						</div>

						<button
							className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 mr-2'
							onClick={async () => {
								if (castInput.length > 0) {
									let youSure = confirm("are you sure you want to submit?");
									if (!youSure) {
										return;
									}
									const submitThis = await parseString(castInput.substring(0, 319));

									try {
										setLoading(true)
										if (channelList.length > 0) {
											if (sendToHome) {
												const { hash } = await hubClient.submitCast(
													{
														text: submitThis.text,
														embeds: submitThis.embeds,
														embedsDeprecated: [],
														mentions: submitThis.mentions,
														mentionsPositions: submitThis.mentionsPositions
													},
													farcasterAccount.fid!,
													privySigner
												)
												toast(`Submitted cast. Message hash: ${hash}`)
											}
											for (let i = 0; i < channelList.length; i++) {

												const { hash } = await hubClient.submitCast(
													{
														text: submitThis.text,
														embeds: submitThis.embeds,
														embedsDeprecated: [],
														mentions: submitThis.mentions,
														mentionsPositions: submitThis.mentionsPositions,
														parentUrl: channelList[i].url
													},
													farcasterAccount.fid!,
													privySigner
												)
												toast(<span>Submitted cast to channel {channelList[i].id}. Message hash: <a className="cursor-pointer" onClick={() => openInBrowser(`https://warpcast.com/${farcasterAccount?.username}/${hash.substring(0, 10)}`)}>{hash}</a></span>)
											}
										}

										if (hashList.length > 0) {
											for (let i = 0; i < hashList.length; i++) {

												const { hash } = await hubClient.submitCast(
													{
														text: submitThis.text,
														embeds: submitThis.embeds,
														embedsDeprecated: [],
														mentions: submitThis.mentions,
														mentionsPositions: submitThis.mentionsPositions,
														parentCastId: { fid: hashList[i].fid, hash: hashList[i].hash }
													},
													farcasterAccount.fid!,
													privySigner
												)
												toast(<span>Submitted cast to cast id {hashList[i].hash}. Message hash: <a className="cursor-pointer" onClick={() => openInBrowser(`https://warpcast.com/${farcasterAccount?.username}/${hash.substring(0, 10)}`)}>{hash}</a></span>)
											}
										}
										if (hashList.length === 0 && channelList.length === 0) {
											const { hash } = await hubClient.submitCast(
												{
													text: submitThis.text,
													embeds: submitThis.embeds,
													embedsDeprecated: [],
													mentions: submitThis.mentions,
													mentionsPositions: submitThis.mentionsPositions
												},
												farcasterAccount.fid!,
												privySigner
											)
											toast(<span>Submitted cast. Message hash: <a className="cursor-pointer" onClick={() => openInBrowser(`https://warpcast.com/${farcasterAccount?.username}/${hash.substring(0, 10)}`)}>{hash}</a></span>)
										}
										setFeed([])

										setTimeout(async () => {
											const feeds = await getFeed();
											if (feeds.next.cursor) {
												setCursor(`&cursor=${feeds.next.cursor}`)
											} else {
												setCursor("")
											}
											setFeed(feeds.casts)
											setCastInput('')
											setChannelList([])
											setHashList([])
											setIsPreview(false)
											setLoading(false)

										}, 2000)



									} catch (e) {

										setLoading(false)
										toast.error("error " + e.message)
									}
								} else {
									setLoading(false)
									toast.error("please input some text")
								}

							}}
							disabled={!castInput && loading}
						>
							{loading ? <div className="flex justify-center items-center">
								<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white-600"></div>
							</div> : "Submit"}
						</button>
						<button disabled={loading}
							className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
							onClick={async () => {
								try {

									if (castInput.substring(0, 319).trim().length === 0) {
										setIsPreview(false)
										throw new Error("please input some text")
									}
									if (isPreview) {
										setIsPreview(false);
										return
									}
									setLoading(true)
									setPreview((await parseString(castInput.substring(0, 319))))
									setIsPreview(true)
									setLoading(false)
								} catch (e) {
									toast.error(e.message)
									setLoading(false)
									setIsPreview(false)
								}

							}}
						>
							{loading ? <div className="flex justify-center items-center">
								<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white-600"></div>
							</div> : (!isPreview ? "Preview" : "Continue Editing")}

						</button>
					</div>
					<p className='mb-2 mt-6 text-sm font-bold uppercase text-gray-600'>
						My Casts
					</p>
					<button
						disabled={loading}
						className='rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700'
						onClick={async () => {
							setLoading(true)
							setLoadCast(true)
							setTimeout(async () => {
								try {
									const feeds = await getFeed();
									setFeed(feeds.casts)
									if (feeds.next.cursor) {
										setCursor(`&cursor=${feeds.next.cursor}`)
									} else {
										setCursor("")
									}
									setLoading(false)
								} catch {
									setLoading(false)
								}

							}, 2000)

						}}
					>
						{loading ? <div className="flex justify-center items-center">
							<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white-600"></div>
						</div> : (loadCast ? "Refresh" : "Load Your Cast")}

					</button>
					<div className='gap-4'>{formattedCasts}</div>
					<button
						disabled={loading}
						className={`${cursor.trim().length === 0 ? "hidden" : ""} rounded-md bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 my-2`}
						onClick={async () => {
							setLoading(true)
							const feeds = await getFeed(cursor);

							setFeed(feed.concat(feeds.casts))
							if (feeds.next.cursor) {
								setCursor(`&cursor=${feeds.next.cursor}`)
							} else {
								setCursor("")
							}
							setLoading(false)
						}}
					>
						{loading ? <div className="flex justify-center items-center">
							<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white-600"></div>
						</div> : <span >Load more</span>}

					</button>
				</>}
			</main>
		</>
	)
}