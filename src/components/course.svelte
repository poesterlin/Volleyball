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
		background-color: rgb(211, 211, 211) !important;
	}

	div:hover {
		background-color: rgb(240, 240, 240);
	}

	div {
		padding: 5%;
		margin: 5px;
		border: 1px solid rgb(240, 240, 240);
	}

	span:not(#right) {
		display: block;
	}

	#right {
		float: right;
	}
</style>
