<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Course from '../components/course.svelte';
	import { server } from '../helpers/env';
	import { goto, prefetch } from '$app/navigation';

	let key;
	let promise;
	let loading = false;

	onMount(() => {
		key = $page.query.get('key') || localStorage.getItem('lastKey');
		if (key) {
			send();
		}
	});

	function send() {
		if (key.length <= 4) {
			return;
		}
		loading = true;
		const fn = async () => {
			const res = await fetch(server + '/registration?regKey=' + encodeURIComponent(key), {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				}
			});

			loading = false;
			if (res.ok) {
				const resp = await res.json();
				return resp.registration;
			}

			throw new Error();
		};

		promise = fn();
	}

	function isEnter(e) {
		promise = undefined;
		if (e.key === 'Enter') {
			send();
		}
	}

	async function cancel(key) {
		loading = true;
		prefetch('/');
		const res = await fetch(server + '/registration?regKey=' + encodeURIComponent(key), {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		}).then(j => j.json());
		loading = false;
		await goto('/');
	}
</script>

<style>
	p {
		margin: 10vh 7vh;
		display: flex;
		justify-content: center;
		background: lightgray;
		padding: 20px;
	}

	input {
		font-size: 40px;
		line-height: 1em;
		padding-left: 5px;
		max-width: 47vw;
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
	}

	b.red {
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

{#if loading}
	<div id="overlay">
		<div class="lds-dual-ring" />
	</div>
{/if}
<a href="/">&lt; back</a>
<p>
	<input
		placeholder="Registration Code"
		type="text"
		on:keyup={isEnter}
		name="name"
		bind:value={key} />
	<button id="check" on:click={send}>Check</button>
</p>
<div id="results">
	{#await promise}
		<h2>loading...</h2>
	{:then value}
		<!-- promise was fulfilled -->
		{#if value}
			<h2>
				Your Registration:
				<button on:click={() => cancel(value.key)}>Cancel Registration</button>
			</h2>
			<b>Name: {value.name}</b>
			{#if value.waitlist}
				<b class="red">Your are on the waitlist. Please check in later for updates.</b>
			{/if}
			Course:
			<Course course={value._course} selected={false} />
		{/if}
	{:catch error}
		<h2>No registration found.</h2>
	{/await}
</div>
