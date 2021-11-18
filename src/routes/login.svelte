<script>
	import { onMount } from 'svelte';
	import authHelper from '../helpers/auth-helper';

	// Fill in with your values
	const AUTH0_CLIENT_ID = 'ZIGkib3PrtAeDIPyOPshh5wVpf0gMmrZ';
	const AUTH0_DOMAIN = 'ausowa.eu.auth0.com';

	let lock;
	let store;

	onMount(() => {
		store = window.localStorage;
	});

	$: isLoggedIn = store && authHelper.authenticated(store);
	$: token = store && store.getItem('id_token');

	const mount = () => {
		lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
			auth: {
				params: {
					scope: 'openid email'
				},
				responseType: 'token id_token'
			}
		});

		// Handle login
		lock.on('authenticated', (authResult) => {
			lock.getUserInfo(authResult.accessToken, (error, profile) => {
				if (error) {
					return;
				}
				authHelper.login(store, authResult, profile);
			});
		});
	};
</script>

<svelte:head>
	<script src="https://cdn.auth0.com/js/lock/11.29.0/lock.min.js" on:load={mount}>
	</script>
</svelte:head>

<div class="container">
	<h2>Login</h2>
	<div class="user-actions">
		{#if isLoggedIn}
			<button on:click={() => authHelper.logout(store)}>Logout</button>
		{:else}
			<button on:click={() => lock.show()}>Log in</button>
		{/if}
	</div>
</div>
