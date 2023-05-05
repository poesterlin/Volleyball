<script lang="ts">
	import { onMount } from 'svelte';
	import authHelper from '$lib/helpers/auth-helper';
	import { goto } from '$app/navigation';

	// Fill in with your values
	const AUTH0_CLIENT_ID = 'ZIGkib3PrtAeDIPyOPshh5wVpf0gMmrZ';
	const AUTH0_DOMAIN = 'ausowa.eu.auth0.com';

	let lock: any;
	let store: any;

	$: isLoggedIn = store && authHelper.authenticated(store);

	onMount(async () => {
		store = window.localStorage;

		await Promise.resolve();

		if (isLoggedIn) {
			await goto('/admin');
		}
	});

	function mount(_node) {
		// @ts-ignore
		if (!window.Auth0Lock) {
			return { destroy() {} };
		}

		// @ts-ignore
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
					return { destroy() {} };
				}

				authHelper.login(store, authResult, profile);
				window.location.href = '/admin';
			});
		});

		return {
			destroy() {}
		};
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
