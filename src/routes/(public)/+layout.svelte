<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: segment = $page.url.pathname.slice(1);
</script>

<slot />

<footer>
	<a href="/" class:active={!segment}>
		<span>Add Registration</span>
		<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
			<line x1="20" y1="40" x2="20" y2="0" />
			<line x1="0" y1="20" x2="40" y2="20" />
		</svg>
	</a>
	<a href="/check" id="check" class:active={segment === 'check'}>
		<svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
			<circle cx="16" cy="16" r="15" />
			<line x1="25" y1="28" x2="40" y2="50" />
		</svg>
		<span>Check Registration</span>
	</a>
</footer>

<style>
	footer {
		position: fixed;
		bottom: 0;
		width: 100%;
		z-index: 100;
		background: #21b5ac;
		display: flex;
		justify-content: center;
		gap: 10%;
		padding: 20px;
		box-sizing: border-box;
	}

	@media screen and (max-width: 400px) {
		span {
			display: none;
		}
	}

	a {
		display: flex;
		height: 30px;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
		padding: 15px;
		color: black;
		gap: 20px;
		background: white;
		border: 3px solid var(--c100);
		border-radius: 5px;
		box-shadow: 2px 2px 3px hsla(0, 0%, 33%, 0.4);
	}

	svg {
		stroke-width: 1px;
		pointer-events: all;
		fill: none;
		height: 40px;
		stroke: currentColor;
		stroke-width: 2px;
	}

	.active {
		background: black;
		color: white;
	}
</style>
