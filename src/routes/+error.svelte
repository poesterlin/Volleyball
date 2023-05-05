<script>
	import { page } from '$app/stores';
</script>

<p>root layout error</p>
<h1>{JSON.stringify($page.error, undefined, '  ')}</h1>
