<script>
	import { server, VAPID_PUBLIC } from '../helpers/env';

    async function enableNotification(){
		await Notification.requestPermission();
		const registration = await navigator.serviceWorker.getRegistration();

		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
		});

		await fetch(server + '/notify', {
			method: 'POST',
			body: JSON.stringify({subscription}),
			headers: {
			'content-type': 'application/json'
			}
		});
	}

	function urlBase64ToUint8Array(base64String) {
		var padding = '='.repeat((4 - base64String.length % 4) % 4);
		var base64 = (base64String + padding)
			.replace(/\-/g, '+')
			.replace(/_/g, '/');

		var rawData = window.atob(base64);
		var outputArray = new Uint8Array(rawData.length);

		for (var i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	}

</script>


<button on:click={enableNotification}>enable notifications (beta)</button>
