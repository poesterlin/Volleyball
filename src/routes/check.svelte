<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Course from '../components/course.svelte';
	import Loading from '../components/loading.svelte';
	import { server } from '../helpers/env';
	import { goto, prefetch } from '$app/navigation';

	let key;
	let promise;
	let loading = false;
	let email;

	onMount(() => {
		key = $page.query.get('key') ?? localStorage.getItem('lastKey');
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

	function isEnter(e, method = send) {
		if (e.key === 'Enter') {
			method();
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
		email = 'registered';
		loading = false;
	}
</script>

<Loading {loading} />
<div id="header">
	<div id="search">
		<input
			placeholder="Registration Code"
			type="text"
			on:keyup={isEnter}
			name="name"
			bind:value={key}
		/>
		<button id="check" on:click={send}>Check</button>
	</div>
</div>
<div id="results">
	{#await promise}
		<h2>loading...</h2>
	{:then value}
		{#if value}
			<h3>{value.name}</h3>
			<Course course={value._course} selected={false} />
			{#if value.waitlist}
				<div id="waitlist" class="dark">
					<b>Your are on the waitlist. Register for E-Mail Updates:</b>
					<div id="emailContainer">
						<input
							placeholder="E-Mail"
							type="email"
							name="email"
							id="email"
							on:keyup={(e) => isEnter(e, notify)}
							bind:value={email}
						/>

						<button on:click={notify}>Submit</button>
					</div>

					<label for="email"
						>Information is only stored until E-Mail is send or the course is done.</label
					>
				</div>
			{/if}
			<button id="cancel" on:click={() => cancel(value.key)}>Cancel Registration</button>
		{/if}
	{:catch _error}
		<h2>No registration found.</h2>
	{/await}
</div>

<style lang="scss">
	@use '../helpers/theme' as *;

	button {
		font-weight: bold;
		cursor: pointer;
		padding: 1em 3em;
	}
	#header {
		padding: 5vh 0vh 1em;
		display: flex;
		justify-content: center;
		width: 100%;
		background: $c20;
		#search {
			display: flex;
			background: white;
			padding: 5px;
			border-radius: 80px;

			&:focus-within {
				box-shadow: 0px 0px 0px 3px $cAccent;
			}

			input {
				font-size: 20px;
				line-height: 1em;
				padding-left: 5px;
				max-width: 47vw;
				border: 0;
				margin-left: 1em;
				outline: 0;
			}

			button {
				color: $c100;
				background: $cAccent;
				border: 0;
				border-radius: 80px;
			}
		}
	}

	#results {
		width: 85%;
		max-width: 800px;
		min-height: calc(100vh - 0px);
		margin: auto;
		padding: 30px;
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
	}
	h2 {
		margin-top: 1em;
	}
	h3 {
		margin-top: 2em;
	}

	#waitlist {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1em;
		margin: 4vh 0 1vh;
		background: $c40;
		padding: 30px 1em;
		border-radius: 10px;
		max-width: calc(90vw - 60px);

		#emailContainer {
			flex: 1 1 80%;
			max-width: 80%;
			min-width: min(100%, 300px);
			display: flex;
			background: $c100;
			padding: 5px;
			border-radius: 80px;

			&:focus-within {
				box-shadow: 0px 0px 0px 3px $cAccent;
			}

			button {
				background: black;
				color: white;
				border: 0;
				cursor: pointer;
				letter-spacing: 0.5px;
				border-radius: 80px;
			}

			input {
				flex: 1 1 80%;
				border-radius: 80px;
				border: 0;
				margin-left: 1em;
				outline: 0;
				min-width: 0;
			}
		}

		#email {
			flex: 1 1 calc(20% - 100px);
			font-size: 20px;
		}

		label {
			color: $c80;
		}
	}

	#cancel {
		min-width: 45%;
		margin: 5vw auto 0;
		color: $c20;
		background: $c100;
		border-radius: 80px;
		border: 1px solid $c20;

		&:hover {
			background: red;
			border: 0;
			color: white;
		}
	}
</style>
