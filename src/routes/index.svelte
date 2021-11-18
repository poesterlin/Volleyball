<script lang="ts">
	import { onMount } from 'svelte';

	import Course from '../components/course.svelte';
	import { server } from '../helpers/env';
	let courses = [];
	let name;
	let triedToSend = false;
	let promise = new Promise(() => {});
	let courseID;

	onMount(async () => {
		const res = await fetch(server + '/courses').then((r) => r.json());
		courses = res.courses;
	});

	const minTextLength = 4;
	$: tooShortText = !name || name.length < minTextLength;
	$: canSend = !tooShortText && courseID;

	function send() {
		if (canSend) {
			triedToSend = true;
			return;
		}
		promise = fetch(server + '/registration', {
			method: 'POST',
			body: JSON.stringify({ name, course: courseID }),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		})
			.then((j) => j.json())
			.then((j) => {
				localStorage.setItem('lastKey', j.registration.key);
				return j.registration;
			});
	}

	function isEnter(e) {
		promise = undefined;
		if (e.key === 'Enter') {
			send();
		}
	}

	function copy(string) {
		navigator.clipboard.writeText(string);
	}
</script>

<h1>🏐 Register for Volleyball 🏐</h1>
<div id="links">
	<a href="/check">Check Registration</a>
	<a href="/login">Admin</a>
</div>
<main>
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
	{#await promise then value}
		{#if value}
			<div id="overlay" on:click={(value = undefined)}>
				<p>
					Registration Code: <b>{value.key}</b>
					<button on:click={() => copy(value.key)}>Copy</button>
				</p>
			</div>
		{/if}
	{/await}
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
		width: 70vw;
	}

	input {
		font-size: 40px;
		line-height: 1em;
	}

	label {
		color: red;
	}

	#list {
		height: 30vh;
		overflow-y: scroll;
		margin: 5px 0;
		border: 1px solid gray;
		padding: 20px;
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

	button.disabled {
		border: 1px solid #999999;
		background-color: #cccccc;
		color: #666666;
	}

	p {
		background: white;
		padding: 60px;
	}
</style>
