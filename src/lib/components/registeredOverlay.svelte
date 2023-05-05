<script>
	import { createEventDispatcher } from 'svelte';

	export let registration;
	const dispatch = createEventDispatcher();

	function copy(string) {
		navigator.clipboard.writeText(string);
		dispatch('close');
	}
</script>

<div id="overlay" on:click={() => dispatch('close')}>
	<div id="inner">
		<p>You are already registered for this course.</p>
		<div id="actions">
			<a id="check" href="/check?key={registration.key}">Check Registration</a>
			<button on:click={() => copy(registration.key)}>Copy Registration Code</button>
		</div>
	</div>
</div>

<style>
	#overlay {
		position: fixed;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.267);
		z-index: 1000;
	}

	p {
		margin-bottom: 2em;
		text-align: center;
		font-weight: bold;
	}

	#inner {
		background: white;
		padding: 2em 60px;
		border-radius: 20px;
	}

	#actions {
		display: flex;
		justify-content: center;
		align-items: center;
		align-content: center;
		flex-wrap: wrap;
		gap: 10px;
		font-size: 14px;
	}

	button,
	a#check {
		flex: 1 1 100%;
		text-align: center;
		font-size: 14px;
		padding: 1em;
		box-sizing: border-box;
		border-radius: 80px;
		cursor: pointer;
		white-space: nowrap;
	}

	button {
		color: var(--c20);
		border: 1px solid var(--c20);
	}

	a#check {
		font-weight: bold;
		color: var(--c100);
		background: var(--cAccent);
	}
</style>
