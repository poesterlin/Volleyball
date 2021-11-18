<script>
	import { daysOfWeek, humanReadableDate, monthsOfYear } from '../helpers/date';
	import Datepicker from 'svelte-calendar';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const difficulties = ['Beginner', 'Advanced', 'Actives'];

	let course = {
		name: 'Volleyball - ',
		location: 'Ellenrieder Sporthalle',
		spots: 18,
		time: '20:30',
		duration: 1.5,
		date: new Date()
	};
</script>

<div id="overlay" on:click|self={() => dispatch('close')}>
	<div id="inner">
		<button id="close" on:click={() => dispatch('close')}>X</button>
		<h3>Create a Course:</h3>
		<p>
			<label for="titel">Titel</label>
			<!-- <input type="text" bind:value={course.name} placeholder="Titel" id="titel" /> -->
			<select bind:value={course.name} id="titel">
				{#each difficulties as difficulty}
					<option value={difficulty}>
						{difficulty}
					</option>
				{/each}
			</select>
		</p>
		<p>
			<label for="location">Location</label>
			<input type="text" bind:value={course.location} placeholder="Location" id="location" />
		</p>
		<p>
			<label for="spots">Spots</label>
			<input type="number" bind:value={course.spots} placeholder="Spots" id="spots" />
		</p>
		<p>
			<label for="duration">Duration</label>
			<input
				type="number"
				bind:value={course.duration}
				step="0.25"
				placeholder="Duration"
				id="duration"
			/>
		</p>

		<Datepicker
			{daysOfWeek}
			{monthsOfYear}
			bind:selected={course.date}
			format={humanReadableDate}
		/>

		<button on:click={() => dispatch('submit', course)}>Create</button>
	</div>
</div>

<style>
	div#overlay {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.267);
	}

	div#inner {
		position: relative;
		background: white;
		padding: 20px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 350px;
	}

	p {
		flex: 1 1 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	p > *:nth-child(2) {
		width: 250px;
	}

	#close {
		position: absolute;
		top: -52px;
		right: 0px;
		background: cadetblue;
		border: 30px solid white;
		box-sizing: content-box;
		border-radius: 50%;
		line-height: 0.9em;
		color: white;
		font-weight: bold;
		font-size: 40px;
		cursor: pointer;
	}

	button:not(#close) {
		display: block;
		margin: 15px auto;
		width: 100%;
		height: 60px;
		background: cadetblue;
		color: white;
		border: 0;
		border-radius: 15px;
		font-weight: bold;
		cursor: pointer;
	}
</style>
