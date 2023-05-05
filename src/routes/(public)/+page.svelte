<script lang="ts">
	import { goto } from '$app/navigation';
	import { humanReadableDate } from '$lib/helpers/date';
	import RegisteredOverlay from '$lib/components/registeredOverlay.svelte';
	import Course from '$lib/components/course.svelte';
	import Loading from '$lib/components/loading.svelte';
	import { server } from '$lib/helpers/env';

	let name: string;
	let triedToSend = false;
	let registration;
	let courseID;
	let showOverlay = false;
	let loading = false;

	export let data;


	if (data.blocks.flatMap((b) => b.courses).length === 1) {
		courseID = data.blocks.flatMap((b) => b.courses)[0]._id;
	}

	const minTextLength = 4;
	$: tooShortText =
		!name || name.length < minTextLength || !new RegExp(/[a-zA-Z]{2,}\s[a-zA-Z]{1,}/).test(name);
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

		const storedKeys = JSON.parse(localStorage.getItem('keys')!) || [];
		storedKeys.push({
			key: res.registration.key,
			date: data.blocks.flatMap((b) => b.courses).find((c) => c._id === courseID)!.date
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
		<label class="red" for="name">Make sure to include your last name.</label>
	{/if}
	<input
		type="text"
		autocomplete="name"
		placeholder="Name"
		on:keyup={isEnter}
		name="name"
		bind:value={name}
	/>
	<div id="list">
		{#each data.blocks as block, i}
			<span>{humanReadableDate(block.date)}</span>
			{#each block.courses as course}
				<Course
					{course}
					on:select={(c) => (courseID = c.detail.course)}
					selected={course._id === courseID}
				/>
			{/each}
			{#if i < data.blocks.length - 1}
				<div class="line" />
			{/if}
		{/each}
		{#if data.blocks.length === 0}There are currently no courses. ☹{/if}
	</div>

	<button id="register" on:click={send} class:disabled={!canSend}>Register</button>
	{#if registration && showOverlay}
		<RegisteredOverlay on:close={() => (showOverlay = false)} {registration} />
	{/if}
</main>

<style>
	span {
		font-size: 14px;
		font-weight: bold;
		text-transform: capitalize;
		margin-top: 20px;
		display: block;
		margin-left: 20px;
	}

	.line {
		width: 60%;
		margin: 60px 20% 50px;
		height: 2px;
		opacity: 0.4;
		background: linear-gradient(90deg, var(--c80) 0%, var(--c40) 50%, var(--c80) 100%);
	}

	main {
		display: flex;
		flex-direction: column;
		margin: 5dvh auto 20dvh;
		width: 90vw;
		max-width: 700px;
		box-sizing: border-box;
	}

	input {
		font-size: 20px;
		line-height: 1em;
		margin: 0 0 20px 0;
		padding: 5px;
		border-radius: 10px;
		border: 3px solid var(--cAccent);
		height: 48px;
	}

	.red {
		color: red;
	}

	#list {
		max-height: 50dvh;
		overflow-y: auto;
		margin-bottom: 4vh;
	}

	@media screen and (max-height: 600px) {
		#list {
			max-height: 40dvh;
		}
	}

	button#register {
		display: block;
		margin: 15px auto 30px;
		padding: 1em 3em;
		background: var(--cAccent);
		color: white;
		border: 0;
		border-radius: 80px;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 1px 1px 8px #0000002e;
	}

	button.disabled {
		border: 2px solid var(--c40);
		background-color: var(--c100);
		color: var(--c80);
		cursor: no-drop;
		box-shadow: unset;
	}
</style>
