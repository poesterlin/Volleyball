<script>
	import { onMount } from 'svelte';
	import authHelper from '../helpers/auth-helper';

	// Fill in with your values
	const AUTH0_CLIENT_ID = 'ZIGkib3PrtAeDIPyOPshh5wVpf0gMmrZ';
	const AUTH0_DOMAIN = 'ausowa.eu.auth0.com';

	let lock;
	let store;

	$: isLoggedIn = store && authHelper.authenticated(store);

	onMount(async () => {
		store = window.localStorage;

		await Promise.resolve();

		if (isLoggedIn) {
			goto('/admin');
		}
	});

	async function mount() {
		await new Promise((res) => setTimeout(res, 500));
		if (!window.Auth0Lock) {
			return;
		}
		lock = new window.Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
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
					console.error(error);
					return;
				}
				authHelper.login(store, authResult, profile);
				window.location.href = '/admin';
			});
		});
	}

	function login() {
		lock.show();
	}
</script>

<svelte:head>
	<script src="https://cdn.auth0.com/js/lock/11.31/lock.min.js" use:mount>
	</script>
</svelte:head>

{#if lock}
	<div class="container">
		<h2>Login</h2>
		<div class="user-actions">
			{#if isLoggedIn}
				<button on:click={() => authHelper.logout(store)}>Logout</button>
			{:else}
				<button on:click={login}>Log in</button>
			{/if}
		</div>
	</div>
{/if}
