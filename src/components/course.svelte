<script>
	import { humanReadableDate } from '../helpers/date';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let course;
	export let selected;
	export let deletable = false;
</script>

<div on:click={() => dispatch('select', { course: course._id })} class:selected>
	<h3>
		<b>{course.name}</b> <span id="right"> {humanReadableDate(course.date)} at {course.time}</span>
	</h3>
	<span>Slots filled: {course.registered.length}/{course.spots}</span>
	<span>Duration: {course.duration} hours</span>
	<span>Location: {course.location}</span>
	{#if deletable}
		<button on:click={() => dispatch('delete')}>Delete</button>
	{/if}
</div>

<style>
	.selected {
		color: white;
		background-color: rgb(117, 117, 117) !important;
		box-sizing: content-box;
		box-shadow: 0 0 0 2px cadetblue ;
	}

	div:hover {
		background-color: rgb(240, 240, 240);
	}

	div {
		padding: 2%;
		margin: 5px;
		border: 1px solid rgb(240, 240, 240);
		position: relative;
	}

	span:not(#right) {
		display: block;
	}

	#right {
		float: right;
	}

	button {
		position: absolute;
		bottom: 2em;
		right: 4ch;
		background: black;
		color: #fff;
		border: 0;
		height: 2em;
		cursor: pointer;
		font-weight: bold;
		letter-spacing: 0.5px;
		padding: 0 25px;
	}
</style>
