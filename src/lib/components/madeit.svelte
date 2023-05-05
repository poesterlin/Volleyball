<script>
	$: randId = Math.floor(Math.random() * 5);
</script>

<style>
	div {
		display: flex;
		flex-direction: row;
		align-items: center;
        justify-content: space-between;
	}
	img {
		object-fit: contain;
		max-height: 8em;
	}

	@keyframes spaceing {
		0%,
		100% {
			letter-spacing: normal;
            filter: hue-rotate(0deg);
		}
		50% {
			letter-spacing: 1em;
            filter: hue-rotate(360deg);
		}
	}

	span {
		animation: spaceing 10s infinite;
		width: 100%;
		text-align: center;
	}
</style>

<div>
	<span>You are in!!</span>
	<img src="/{randId}.gif" alt="You made it gif" />
</div>
