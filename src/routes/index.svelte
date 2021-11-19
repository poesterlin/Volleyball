<script lang="ts">
	import { humanReadableDate } from '../helpers/date';
	import { onMount } from 'svelte';
	import Course from '../components/course.svelte';
	import { server } from '../helpers/env';

	let courses = [];
	let name;
	let triedToSend = false;
	let registration;
	let courseID;
	let showOverlay = false;
	let loading = false;

	onMount(async () => {
		await update();
	});

	async function update() {
		loading = true;
		const res = await fetch(server + '/courses').then((r) => r.json());
		courses = res.courses;
		loading = false;
	}

	const minTextLength = 4;
	$: tooShortText = !name || name.length < minTextLength;
	$: canSend = !tooShortText && courseID;

	async function send() {
		if (!canSend) {
			triedToSend = true;
			return;
		}
		loading = true;

		const res = await fetch(server + '/registration', {
			method: 'POST',
			body: JSON.stringify({ name, course: courseID, lastKey: localStorage.getItem('lastKey') }),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		}).then((j) => j.json());

		localStorage.setItem('lastKey', res.registration.key);
		registration = res.registration;

		await update();
		showOverlay = true;
	}

	function isEnter(e) {
		if (e.key === 'Enter') {
			send();
		}
	}

	function copy(string) {
		navigator.clipboard.writeText(string);
		showOverlay = false;
	}

	function getCourseInfo() {
		if (!courseID) {
			return;
		}

		const { name, time, date } = courses.find((c) => c._id === courseID);

		return `${name} course on ${humanReadableDate(date)} at ${time}`;
	}
</script>

{#if loading}
	<div id="overlay">
		<div class="lds-dual-ring" />
	</div>
{/if}
<h1>🏐 Register for Volleyball 🏐</h1>
<div id="links">
	<a href="/check">Check Registration</a>
	<a href="/login">Admin</a>
	<a href="https://github.com/poesterlin/Volleyball">Contribute</a>
</div>
<main>
	<span>Please put in your name and select a course to attend.</span>
	<input type="text" placeholder="Name" on:keyup={isEnter} name="name" bind:value={name} />
	<div id="list">
		{#each courses as course}
			<Course
				{course}
				on:select={(c) => (courseID = c.detail.course)}
				selected={course._id === courseID}
			/>
		{/each}

		{#if courses.length === 0}
			There are currently no courses. ☹
		{/if}
	</div>
	{#if !canSend && triedToSend}
		<label for="name">Name too short!</label>
	{/if}
	<button on:click={send} class:disabled={!canSend}>Register</button>
	{#if registration && showOverlay}
		<div id="overlay" on:click={() => (showOverlay = false)}>
			<div id="inner">
				{#if registration.registeredTwice}
					<span class="underline"> You are already registered for this course. </span>
				{:else}
					<h3>
						You registered for:
						<span class="underline">{getCourseInfo()}</span>
					</h3>
				{/if}
				<p>
					{#if registration.waitlist}
						<b class="red">You are on the waitlist. Check your registration status again later.</b>
					{/if}
					Registration Code: <b>{registration.key}</b>
				</p>
				<button on:click={() => copy(registration.key)}>Copy Registration Code</button>
			</div>
		</div>
	{/if}
</main>

<style type="text/scss">
	$padding: 5px;

	h1 {
		margin-top: 2em;
		text-align: center;
		font-size: 27px;
	}

	main {
		display: flex;
		align-content: center;
		justify-content: center;
		height: 70vh;
		flex-direction: column;
		margin: 5vh auto 0;
		width: 90vw;
		max-width: 1000px;
	}

	input {
		font-size: 40px;
		line-height: 1em;
	}

	label,
	.red {
		color: red;
	}

	#list {
		height: 30vh;
		overflow-y: scroll;
		margin: 5px 0;
		border: 1px solid gray;
		padding: 2%;
	}
	button {
		display: block;
		margin: 15px auto;
		width: 100%;
		height: 60px;
		background: cadetblue;
		color: white;
		border: 0;
		border-radius: 15px;
		font-weight: bold;
		cursor: pointer;
	}

	#links {
		display: flex;
		justify-content: center;
		gap: 20px;
		color: cadetblue;
		font-weight: bold;
	}

	#overlay {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.267);
	}

	.underline {
		text-decoration: underline;
		display: block;
		margin: 65px 0;
		background: black;
		color: white;
		padding: 30px;
	}

	button.disabled {
		border: 1px solid #999999;
		background-color: #cccccc;
		color: #666666;
	}

	#inner {
		background: white;
		padding: 60px;
	}

	div#overlay {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.267);
		z-index: 100;
	}

	.lds-dual-ring {
		display: inline-block;
		width: 80px;
		height: 80px;
	}
	.lds-dual-ring:after {
		content: ' ';
		display: block;
		width: 64px;
		height: 64px;
		margin: 8px;
		border-radius: 50%;
		border: 6px solid #fff;
		border-color: #fff transparent #fff transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
