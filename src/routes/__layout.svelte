<script>
	import { page } from '$app/stores';

	$: segment = $page.path.substr(1);

	let innerWidth = 800;
	const height = 160;
	const arcSize = 80;
	const arc = `a 1 1 0 0 0 ${arcSize} 0`;

	const arcDist = 40;
	const padding = innerWidth * 0.1;
	$: totalWidth = innerWidth + 2 * padding;
	$: firstArc = totalWidth / 2 - arcDist - arcSize;
</script>

<style lang="scss">
	@use '../helpers/theme' as *;
	:global(body) {
		overflow-y: overlay;
		overflow-x: hidden;
	}
	header {
		background: $c20;
		position: relative;
		padding: 15px 30px;

		h1 {
			font-size: 20px;
			font-weight: bold;
			margin: 0;
			text-shadow: 0px 0px 10px $c20;
		}

		img {
			height: 200%;
			position: absolute;
			top: -50%;
			right: -10px;
			bottom: -50%;
		}
	}

	div {
		position: sticky;
		bottom: max(8vh, 60px);
		z-index: 100;
		a {
			position: absolute;
			width: 30px;
			height: 30px;
			border-radius: 50%;
			border: 1px solid $c0;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 15px;
		}
		a:first-child {
			transform: translate(calc(50vw - 105px), -30px);
		}

		a:nth-child(2) {
			transform: translate(calc(50vw + 45px), -30px);
		}

		a:not(.active) {
			background: white;
			stroke: black;
		}

		svg {
			stroke-width: 1px;
			pointer-events: all;
			fill: none;
			height: 40px;
		}
	}

	.active {
		background: black;
		& > svg {
			stroke: white;
			stroke-width: 2px;
		}
	}

	svg#arcs {
		position: absolute;
		width: 100%;
		height: 150px;
		fill: $cAccent;
		pointer-events: none;
	}
</style>

<svelte:window bind:innerWidth />

<header class="dark">
	<a href="/">
		<h1>Register for Volleyball</h1>
	</a>
	<a href="/login">
		<img src="/Volleyball_icon.svg" alt="" />
	</a>
</header>

<slot />

{#if !segment || segment === 'check'}
	<div>
		<a href="/" class:active={!segment} sveltekit:prefetch>
			<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
				<line x1="20" y1="40" x2="20" y2="0" />
				<line x1="0" y1="20" x2="40" y2="20" />
			</svg>
		</a>
		<a href="/check" id="check" class:active={segment === 'check'} sveltekit:prefetch>
			<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
				<circle cx="16" cy="16" r="15" />
				<line x1="25" y1="28" x2="40" y2="50" />
			</svg>
		</a>
		<svg
			id="arcs"
			viewBox="{padding} 0 {innerWidth}
			{height}"
			height="{height}px"
			width="{totalWidth}px">
			<path d="M 0 0 h {firstArc} {arc} h {arcDist * 2} {arc} H {totalWidth} V {height} H 0" />
		</svg>
	</div>
{/if}
