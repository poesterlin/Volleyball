<script>
	import { onMount } from 'svelte';
	import Course from '../components/course.svelte';
	import { server } from '../helpers/env';

	let key;
	let promise;

	onMount(() => {
		key = localStorage.getItem('lastKey');
	});

	function send() {
		if (key.length <= 4) {
			return;
		}
		promise = fetch(server + '/registration?regKey=' + encodeURIComponent(key), {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		})
			.then((j) => j.json())
			.then((j) => j.registration);
	}

	function isEnter(e) {
		promise = undefined;
		if (e.key === 'Enter') {
			send();
		}
	}

	function cancel(key) {
		const res = fetch(server + '/registration?regKey=' + encodeURIComponent(key), {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		}).then((j) => j.json());
		console.log(res);
	}
</script>

<a href="/"> &lt; back</a>
<p>
	<input
		placeholder="Registration Code"
		type="text"
		on:keyup={isEnter}
		name="name"
		bind:value={key}
	/>
	<button id="check" on:click={send}>Check</button>
</p>
<div id="results">
	{#await promise then value}
		{#if value}
			<h2>
				Your Registration:
				<button on:click={() => cancel(value.key)}>Cancel Registration</button>
			</h2>
			{#if value.waitlist}
				<b>Your are on the waitlist. Please check in later for updates.</b>
			{/if}
			Course:
			<Course course={value._course} selected={false} />
		{/if}
	{/await}
</div>

<style>
	p {
		margin: 10vh;
		display: flex;
		justify-content: center;
		background: lightgray;
		padding: 20px;
	}

	input {
		font-size: 40px;
		line-height: 1em;
		padding-left: 5px;
	}

	button {
		background: cadetblue;
		color: white;
		border: 0;
		font-weight: bold;
		cursor: pointer;
	}

	#check {
		margin-left: 5px;
		width: 20%;
		min-width: max-content;
	}

	#results {
		width: 80%;
		margin: auto;
	}

	b {
		display: block;
		margin: 2em 0;
		color: red;
	}

	h2 {
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		flex-wrap: wrap;
	}

	a {
		position: fixed;
		top: 1em;
		left: 1em;
        padding: 20px;
	}
</style>
