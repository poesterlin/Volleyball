<script>
	import { daysOfWeek, humanReadableDate, monthsOfYear, addDays } from '../helpers/date';
	import Datepicker from 'svelte-calendar';
	import { createEventDispatcher } from 'svelte';
	import { nextMonday, nextSaturday, nextThursday, nextTuesday, nextWednesday } from 'date-fns';
	const dispatch = createEventDispatcher();

	const difficulties = [
		'Beginner',
		'Advanced',
		'Actives',
		'Beach Course',
		'Actives - 5:1 System',
		'Free Game',
		'Christmas Special🎄'
	];

	let course = {
		name: 'Volleyball - ',
		location: 'Ellenrieder Sporthalle',
		spots: 18,
		time: '20:30',
		duration: 1.5,
		date: addDays(new Date(), 7),
		publishOn: new Date()
	};

	let defaults = [
		{
			name: difficulties[0],
			settings: {
				name: difficulties[0],
				location: 'Ellenrieder Sporthalle',
				spots: 18,
				time: '17:30',
				duration: 1.5,
				date: nextMonday(new Date()),
				publishOn: nextThursday(new Date())
			}
		},
		{
			name: difficulties[1],
			settings: {
				name: difficulties[1],
				location: 'Ellenrieder Sporthalle',
				spots: 18,
				time: '19:00',
				duration: 1.5,
				date: nextMonday(new Date()),
				publishOn: nextThursday(new Date())
			}
		},
		{
			name: difficulties[2],
			settings: {
				name: difficulties[2],
				location: 'Ellenrieder Sporthalle',
				spots: 18,
				time: '20:30',
				duration: 1.5,
				date: nextMonday(new Date()),
				publishOn: nextThursday(new Date())
			}
		},
		{
			name: difficulties[4],
			settings: {
				name: difficulties[4],
				location: 'Ellenrieder Sporthalle',
				spots: 18,
				time: '20:30',
				duration: 1.5,
				date: nextWednesday(new Date()),
				publishOn: nextThursday(new Date())
			}
		},
		{
			name: difficulties[5],
			settings: {
				name: difficulties[5],
				location: 'Petershausener Sporthalle',
				spots: 36,
				time: '12:00',
				duration: 1.5,
				date: nextSaturday(new Date()),
				publishOn: nextTuesday(new Date())
			}
		}
	];

	function applyDefault(settings) {
		Object.keys(settings).forEach((key) => {
			course[key] = settings[key];
		});
	}
</script>

<div id="overlay" on:click|self={() => dispatch('close')}>
	<div id="inner">
		<button id="close" on:click={() => dispatch('close')}>X</button>
		<h3>Create a Course:</h3>
		<div id="defaults">
			{#each defaults as setting}
				<button on:click={() => applyDefault(setting.settings)}>{setting.name}</button>
			{/each}
		</div>
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
		<p>
			<label for="time">Time</label>
			<input type="text" bind:value={course.time} placeholder="Time" id="time" />
		</p>
		<p>
			<label for="">Date:</label>
			<Datepicker
				{daysOfWeek}
				{monthsOfYear}
				start={new Date()}
				startOfWeekIndex={1}
				bind:selected={course.date}
				format={humanReadableDate}
			/>
		</p>
		<p>
			<label for="">Publish on:</label>
			<Datepicker
				{daysOfWeek}
				{monthsOfYear}
				start={addDays(new Date(), -7)}
				startOfWeekIndex={1}
				bind:selected={course.publishOn}
				format={humanReadableDate}
			/>
		</p>
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
		width: 400px;
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

	#defaults {
		display: flex;
		gap: 7px;
		background: #e4dfdf;
		padding: 6px;
		margin: 0 -20px 7px;
		opacity: 0.9;
	}
	h3 {
		background: cadetblue;
		width: calc(100% + 40px);
		margin: -20px;
		margin-bottom: 0;
		color: white;
		text-align: center;
		padding: 20px;
	}
</style>
