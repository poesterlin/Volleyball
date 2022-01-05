<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Course from '../components/course.svelte';
	import MadeIt from '../components/madeit.svelte';
	import Loading from '../components/loading.svelte';
	import { server } from '../helpers/env';
	import { goto, prefetch } from '$app/navigation';
	import { humanReadableDate } from '../helpers/date';
	import { differenceInCalendarDays } from 'date-fns';

	let key;
	let keys = [];
	let promise;
	let loading = false;
	let email;
	let dropdown = false;

	onMount(() => {
		key = $page.query.get('key') || localStorage.getItem('lastKey');
		const storedKeys = JSON.parse(localStorage.getItem('keys'));

		if (key) {
			send();
		}

		if (!storedKeys) {
			return;
		}

		const today = new Date();
		const seen = {};
		keys = storedKeys
				.filter(k => differenceInCalendarDays(new Date(k.date), today) >= -1)
				.filter((item)=> seen.hasOwnProperty(item.key) ? false : (seen[item.key] = true));

		if (keys.length === 1) {
			key = keys[0].key;
			send();
		}

		localStorage.setItem('keys', JSON.stringify(keys));
	});

	function send() {
		if (key.length <= 4) {
			return;
		}
		loading = true;
		const fn = async () => {
			try {
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
			} catch (error) {}

			const storedKeys = JSON.parse(localStorage.getItem('keys'));
			keys = storedKeys.filter(f=>f.key !== key);
			localStorage.setItem('keys', JSON.stringify(keys));
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
		}).then(j => j.json());
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
		}).then(j => j.json());
		email = 'registered';
		loading = false;
	}

	async function select(val) {
		key = val.key;
		dropdown = false;
		await send();
	}
</script>

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
			position: relative;
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

			.small {
				padding: 0 1em;
				background: $c100;
				color: $c0;
				font-weight: bold;
				margin-right: 3px;

				&:hover,
				&.active {
					background: $c80;
				}
			}

			div {
				position: absolute;
				z-index: 100;
				display: flex;
				flex-wrap: wrap;
				flex-direction: column;
				top: calc(100% + 7px);
				right: 0;
				gap: 7px;
				background: $c0;
				border-radius: 20px;
				padding: 5px;
				box-sizing: border-box;
				width: 80%;
				box-shadow: 2px 3px 10px #00000059;
				min-width: max-content;

				button {
					display: flex;
					justify-content: space-between;
					background: white;

					&:hover {
						box-shadow: 0px 0px 0px 2px $cAccent;
					}
				}
				span:first-child {
					color: $c40;
					font-weight: normal;
				}
				span:nth-child(2) {
					font-weight: bold;
				}
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
        font-weight: bold;
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

		big {
			text-decoration: underline;
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

<Loading {loading} />
<div id="header">
	<div id="search">
		<input
			placeholder="Registration Code"
			type="text"
			on:keyup={isEnter}
			name="name"
			bind:value={key} />
		{#if keys.length > 1}
			<button class="small" on:click={() => (dropdown = !dropdown)} class:active={dropdown}>
				&or;
			</button>
		{/if}
		{#if dropdown}
			<div>
				{#each keys as k}
					<button on:click={() => select(k)}>
						<span>{k.key}</span>
						<span>{humanReadableDate(k.date)}</span>
					</button>
				{/each}
			</div>
		{/if}

		<button id="check" on:click={send}>Check</button>
	</div>
</div>
<div id="results">
	{#await promise}
		<h2>loading...</h2>
	{:then value}
		{#if value}
			{#if !value.waitlist}
				<MadeIt />
			{/if}
			<h3>{value.name}</h3>
			<Course course={value._course} selected={false} fullDate />
			{#if value.waitlist}
				<div id="waitlist" class="dark">
					<b>
						You have spot
						<big>#{value.waitlistSpot}</big>
						on the waitlist. Register for E-Mail Updates:
					</b>
					<div id="emailContainer">
						<input
							placeholder="E-Mail"
							type="email"
							name="email"
							id="email"
							on:keyup={e => isEnter(e, notify)}
							bind:value={email} />

						<button on:click={notify}>Submit</button>
					</div>

					<label for="email">
						Information is only stored until E-Mail is send or the course is done.
					</label>
				</div>
			{/if}
			<button id="cancel" on:click={() => cancel(value.key)}>Cancel Registration</button>
		{/if}
	{:catch _error}
		<h2>No registration found.</h2>
	{/await}
</div>
