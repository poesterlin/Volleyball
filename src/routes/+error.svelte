<script>
	import { page } from '$app/stores';
</script>

<h1>{JSON.stringify($page.error, undefined, '  ')}</h1>
