<script>
	import { humanReadableDate } from '../helpers/date';
	import { createEventDispatcher } from 'svelte';
	import Scale from './scale.svelte';
	const dispatch = createEventDispatcher();

	export let course;
	export let selected;
	export let deletable = false;
	export let fullDate = false;
	export let showPublishDate = false;

	$: registered = Array.isArray(course?.registered)
		? course?.registered?.length
		: course?.registered;

	$: formated = new Intl.DateTimeFormat('en-GB', {
		weekday: 'short',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(course.publishOn));
</script>

<div
	class="course"
	on:click={() => dispatch('select', { course: course._id })}
	class:dark={selected}
>
	<div class="flex">
		<b>{course.name}</b>
		<span id="time">
			{#if fullDate}
				{humanReadableDate(course.date)} at {course.time}
			{:else}
				{course.time}
			{/if}
		</span>
	</div>
	<Scale avaliable={course.spots} booked={registered} dark={selected} />
	<span>{course.location}</span>
	{#if showPublishDate}
		<br />
		<span>Publish On: {formated} </span>
	{/if}
	{#if deletable}
		<button on:click={() => dispatch('delete')}>Delete</button>
	{/if}
</div>

<style lang="scss">
	@use '../helpers/theme' as *;
	@use 'sass:color';

	@mixin markerLine($color) {
		&::before {
			$width: 4px;
			content: '';
			position: absolute;
			top: 10px;
			left: $width;
			right: 0;
			z-index: 5;
			bottom: 10px;
			box-shadow: -$width 0px 0 0px $color;
			pointer-events: none;
		}
	}

	.dark {
		background: $c40 !important;
		color: var(--c100);
	}

	div.course:hover,
	div.course.dark {
		@include markerLine($cAccent);
	}

	div.course {
		background: linear-gradient(90deg, $c100 20%, color.scale($c80, $alpha: -60%) 100%);
		border-radius: 10px;
		padding: 15px 20px;
		margin-top: 10px;
		position: relative;
		cursor: pointer;

		@include markerLine($c0);
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
		float: right;
	}

	.flex {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}
</style>
