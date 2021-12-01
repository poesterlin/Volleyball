<script>
	import { humanReadableDate } from '../helpers/date';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let course;
	export let selected;
	export let deletable = false;
</script>

<div class="course" on:click={() => dispatch('select', { course: course._id })} class:selected>
	<h3 class="flex">
		<b>{course.name}</b> <span id="right"> {humanReadableDate(course.date)} at {course.time}</span>
	</h3>
	<div class="flex">
		<span>Registered: {#if Array.isArray(course.registered)}{course.registered.length}{:else}{course.registered}{/if}/{course.spots}</span>
		<span>{course.duration} hours</span>
		<span>{course.location}</span>
		{#if deletable}
			<button on:click={() => dispatch('delete')}>Delete</button>
		{/if}
	</div>
</div>

<style>
	.selected {
		color: white;
		background-color: rgb(117, 117, 117) !important;
		box-sizing: content-box;
		box-shadow: 0 0 0 2px cadetblue;
	}

	div.course:hover {
		background-color: rgb(240, 240, 240);
	}

	div.course {
		padding: 2%;
		margin: 5px;
		border: 1px solid rgb(240, 240, 240);
		position: relative;
	}

	span {
		display: block;
	}

	#right {
		margin-left: 10%;
	}

	h3 {
		margin-bottom: 20px;
		background: rgb(233, 233, 233);
		padding: 1% 0;
		color: black;
	}

	button {
		background: black;
		color: #fff;
		border: 0;
		height: 2em;
		cursor: pointer;
		font-weight: bold;
		letter-spacing: 0.5px;
		padding: 0 25px;
	}

	.flex {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
	}
</style>
