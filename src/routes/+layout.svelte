<script>
	import * as Sentry from '@sentry/browser';

	Sentry.init({
		dsn: 'https://85cdfcf11ffe4ab1b7ef383e33b29945@o4505130185261056.ingest.sentry.io/4505130186440704',
		integrations: [new Sentry.BrowserTracing()],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0
	});
</script>

<header>
	<a href="/">
		<h1>Register for Volleyball</h1>
	</a>
	<a href="/login">
		<img src="/Volleyball_icon.svg" alt="" />
	</a>
</header>

<slot />

<style lang="scss">
	:global(body) {
		--c0: black;
		--c20: #3b3b37;
		--c40: #4d4747;
		--c80: #d0d0d0;
		--c100: white;
		--cAccent: #21b5ac;
		--breakpoint-sm: 576px;
		--breakpoint-md: 768px;

		overflow-x: hidden;
		color: var(--c0);
	}

	header {
		background: var(--c20);
		position: relative;
		padding: 15px 30px;
		color: var(--c100);

		h1 {
			font-size: 20px;
			font-weight: bold;
			margin: 0;
			text-shadow: 0px 0px 10px var(--c20);
		}

		img {
			height: 200%;
			position: absolute;
			top: -50%;
			right: -10px;
			bottom: -50%;
		}
	}
</style>
