<script lang="ts">
	import { goto } from '$app/navigation';
	import { humanReadableDate } from '../helpers/date';
	import { onMount } from 'svelte';
	import RegisteredOverlay from '../components/registeredOverlay.svelte';
	import Course from '../components/course.svelte';
	import Loading from '../components/loading.svelte';
	import { server } from '../helpers/env';

	let blocks = [];
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
		let { courses: res } = await fetch(server + '/courses').then(r => r.json());

		res.forEach(course => {
			course.date = new Date(course.date);
		});

		const dates = (res as any[]).reduce((map, c) => map.set(c.date.toDateString()), new Map());

		blocks = Array.from(dates.keys()).map(date => ({
			date,
			courses: res.filter(c => c.date.toDateString() === date)
		}));

		loading = false;
		if (blocks.flatMap(b => b.courses).length === 1) {
			courseID = blocks.flatMap(b => b.courses)[0]._id;
		}
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
		}).then(j => j.json());

		localStorage.setItem('lastKey', res.registration.key);

		const storedKeys = JSON.parse(localStorage.getItem('keys')) || [];
		storedKeys.push({
			key: res.registration.key,
			date: blocks.flatMap(b => b.courses).find(c => c._id === courseID).date
		});
		localStorage.setItem('keys', JSON.stringify(storedKeys));

		registration = res.registration;

		loading = false;
		if (registration.registeredTwice) {
			showOverlay = true;
			return;
		}

		goto('check');
	}

	function isEnter(e) {
		if (e.key === 'Enter') {
			send();
		}
	}
</script>

<Loading {loading} />

<main>
	{#if !canSend && triedToSend}
		<label class="red" for="name">Name too short!</label>
	{/if}
	<input type="text" placeholder="Name" on:keyup={isEnter} name="name" bind:value={name} />
	<div id="list">
		{#each blocks as block,i}
			<span>{humanReadableDate(block.date)}</span>
			{#each block.courses as course}
				<Course
					{course}
					on:select={(c) => (courseID = c.detail.course)}
					selected={course._id === courseID}
				/>
			{/each}
			{#if i < blocks.length - 1}
				<div class="line"></div>
			{/if}
		{/each}
		{#if blocks.length === 0}There are currently no courses. ☹{/if}
	</div>

	<button id="register" on:click={send} class:disabled={!canSend}>Register</button>
	{#if registration && showOverlay}
		<RegisteredOverlay on:close={()=>showOverlay = false} {registration} />
	{/if}
</main>

<style lang="scss">
	@use '../helpers/theme' as *;
	@use 'sass:color';

	$padding: 5px;

	span {
		font-size: 14px;
		font-weight: bold;
		text-transform: capitalize;
		margin-top: 20px;
		display: block;
		margin-left: 20px;
	}

	.line{
		width: 60%;
		margin: 60px 20% 50px;
		height: 2px;
		opacity: 0.4;
		background: linear-gradient(90deg, $c80 0%, $c40 50%, $c80 100%);
	}

	main {
		display: flex;
		flex-direction: column;
		margin: 5vh auto;
		width: 90vw;
		max-width: 700px;
		min-height: 100vh;
	}

	input {
		font-size: 20px;
		line-height: 1em;
		margin: 0 0 20px 0;
		padding: 5px;
		border-radius: 10px;
		border: 3px solid $cAccent;
		height: 48px;
	}

	.red {
		color: red;
	}

	#list {
		max-height: 40vh;
		overflow-y: auto;
		margin-bottom: 4vh;
	}

	button {
		display: block;
		margin: 15px auto;
		padding: 1em 3em;
		background: $cAccent;
		color: white;
		border: 0;
		border-radius: 80px;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 1px 1px 8px #0000002e;
	}

	button.disabled {
		border: 2px solid $c40;
		background-color: $c100;
		color: $c80;
		cursor: no-drop;
		box-shadow: unset;
	}
</style>
