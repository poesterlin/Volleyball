<script>
	export let avaliable;
	export let booked;
	export let dark = false;
</script>

<div id="wrapper" class:dark>
	<div id="full" />
	<div id="scale" style="--percent: {booked / avaliable}" class:red={booked / avaliable > 1} />
	<span>{booked}/{avaliable}</span>
</div>

<style>
	#wrapper {
		position: relative;
		width: 100%;
		height: 1em;
		font-size: 14px;
		font-weight: bold;
		margin-bottom: 8px;
	}

	#full,
	#scale,
	span {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	#full,
	#scale {
		background: var(--c80);
	}

	#full {
		height: 1px;
		transform: translateY(0.5em);
	}

	#scale {
		height: 5px;
		border-radius: 5px;
		transform: translateY(calc(0.5em - 2px));
		width: calc(var(--percent) * 100%);
		max-width: 100%;
	}

	#scale.red {
		background: rgba(255, 0, 0, 0.233);
	}

	span {
		text-align: center;
		transform: translateY(-0.3em);
		text-shadow: 0 0 4px rgba(255, 255, 255, 0.2);
	}

	.dark > span {
		text-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
	}
</style>
