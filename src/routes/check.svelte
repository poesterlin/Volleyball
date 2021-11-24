<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Course from '../components/course.svelte';
	import { server } from '../helpers/env';
	import { goto, prefetch } from '$app/navigation';

	let key;
	let promise;
	let loading = false;
	let email;

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
		await fetch(server + '/registration?regKey=' + encodeURIComponent(key), {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		}).then((j) => j.json());
		loading = false;
		await goto('/');
	}

	async function notify() {
		loading = true;
		await fetch(server + '/registration/notify', {
			method: 'POST',
			body: JSON.stringify({ email, key }),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		}).then((j) => j.json());
		email = "registered";
		loading = false;
	}
</script>

{#if loading}
	<div id="overlay">
		<div class="lds-dual-ring" />
	</div>
{/if}
<a href="/">&lt; back</a>
<header>
	<input
		placeholder="Registration Code"
		type="text"
		on:keyup={isEnter}
		name="name"
		bind:value={key}
	/>
	<button id="check" on:click={send}>Check</button>
</header>
<div id="results">
	{#await promise}
		<h2>loading...</h2>
	{:then value}
		{#if value}
			<h2>Registration for {value.name}:</h2>
			<Course course={value._course} selected={false} />
			{#if value.waitlist}
				<div id="emailContainer">
					<b>Your are on the waitlist. Please check in later for updates.</b>
					<input
						placeholder="Submit your Email for one time updates."
						type="email"
						name="email"
						id="email"
						bind:value={email}
					/>

					<button on:click={notify}>Submit</button>

					<label for="email"
						>Information is only stored until Email is send or the course is done.</label
					>
				</div>
				<button id="cancel" on:click={() => cancel(value.key)}>Cancel Registration</button>
			{/if}
		{/if}
	{:catch _error}
		<h2>No registration found.</h2>
	{/await}
</div>

<style>
	#emailContainer > button {
		background: black;
		color: white;
		border: 0;
		cursor: pointer;
		letter-spacing: 0.5px;
		font-size: 20px;
	}
	#emailContainer {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 5px;
		padding: 20px;
		background: #e9e9e9;
		margin: 4em 5px;
	}

	#email {
		flex: 1 1 calc(100% - 100px);
		font-size: 20px;
	}

	label {
		color: grey;
	}
	header {
		margin: 10vh 0vh 3em;
		display: flex;
		justify-content: center;
		background: #334d4b;
		padding: 20px;
		width: calc(100% - 40px);
	}

	header > input {
		font-size: 40px;
		line-height: 1em;
		padding-left: 5px;
		max-width: 47vw;
	}

	header > button,
	#cancel {
		background: hsl(182, 25%, 50%);
		color: white;
		border: 0;
		font-weight: bold;
		cursor: pointer;
	}

	#cancel {
		background: hsl(2, 80%, 40%);
		height: 60px;
	}

	#check {
		margin-left: 5px;
		width: 20%;
		min-width: max-content;
	}

	#results {
		width: 80%;
		margin: auto;
		border: 1px solid #dddddd;
		padding: 30px;
		box-shadow: 3px 2px 7px #d7d7d7;
	}

	b {
		display: block;
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
