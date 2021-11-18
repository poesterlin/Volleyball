<script>
	import { dev } from '$app/env';
	import { server } from '../helpers/env';
	import { onMount } from 'svelte';
	import authHelper from '../helpers/auth-helper';
	import Course from '../components/course.svelte';
	import CourseCreator from '../components/createCourse.svelte';

	let store;
	let courses = [];
	let courseID;
	let registrations = [];
	let showOverlay = false;

	$: isLoggedIn = store && authHelper.authenticated(store);
	$: token = store && store.getItem('id_token');

	onMount(async () => {
		store = window.localStorage;

		await Promise.resolve();

		if (!isLoggedIn && !dev) {
			window.location.href = '/login';
		}
		await fetchCourses();
	});

	async function fetchCourses() {
		const res = await fetch(server + '/course/details', {
			headers: { Authorization: `Bearer ${token}` }
		}).then((r) => r.json());

		courses = res.courses;
	}

	function showRegistrations({ detail }) {
		courseID = detail.course;
		const course = courses.find((c) => c._id === courseID);
		registrations = course.registered;
	}
	async function deleteCourse() {
		await fetch(server + '/course/delete', {
			method: 'POST',
			body: JSON.stringify({ id: courseID }),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		}).then((r) => r.json());
		await update();
	}

	async function deleteRegistaration(key) {
		const res = await fetch(server + '/registration?regKey=' + encodeURIComponent(key), {
			method: 'DELETE'
		}).then((r) => r.json());
		await update();
	}

	async function createCourse({ detail }) {
		const res = await fetch(server + '/course/new', {
			method: 'POST',
			body: JSON.stringify(detail),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		}).then((r) => r.json());
		await update();
	}

	function format(date) {
		return new Intl.DateTimeFormat('de', {
			month: 'numeric',
			day: 'numeric',
			minute: 'numeric',
			hour: 'numeric'
		}).format(new Date(date));
	}

	async function update() {
		await fetchCourses();

		if (courseID) {
			showRegistrations({ detail: { course: courseID } });
		}
	}

	function toggleOverlay() {
		showOverlay = !showOverlay;
	}
</script>

<div id="columns">
	<div id="left">
		<h2>Courses <button id="add" on:click={toggleOverlay}>+</button></h2>
		<button on:click={deleteCourse} disabled={!courseID}>Delete</button>
		{#each courses as course}
			<Course {course} selected={courseID === course._id} on:select={(c) => showRegistrations(c)} />
		{/each}
	</div>
	<div id="right">
		{#if registrations}
			<h2>Registrations</h2>
			<table>
				{#each registrations as reg}
					<div class="registration" class:waitlist={reg.waitlist}>
						<span><b>{reg.name}</b></span>
						<span>{format(reg.registered)}</span>
						<span class="gray">{reg.key}</span>
						<span>
							<button class="registrationButton" on:click={() => deleteRegistaration(reg.key)}
								>Cancel</button
							></span
						>
					</div>
				{/each}
			</table>
		{:else}
			Select a course.
		{/if}
	</div>
</div>

{#if showOverlay}
	<CourseCreator on:submit={createCourse} on:close={toggleOverlay} />
{/if}

<style>
	#columns {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 90vw;
		margin: auto;
	}

	#left,
	#right {
		flex: 1 1 500px;
		max-width: 500px;
	}

	#left {
		border-right: 10px solid grey;
	}

	#right {
		padding: 20px;
		display: table;
	}

	.waitlist {
		background: rgba(255, 0, 0, 0.267);
	}

	.registration {
		display: table-row;
		outline: 1px solid black;
	}

	.registration > * {
		display: table-cell;
		text-align: center;
		vertical-align: middle;
		height: 50px;
	}

	.registrationButton {
		background: black;
		color: white;
		border: 0;
		height: 80%;
		cursor: pointer;
	}

	.gray {
		color: #272727;
	}

	b {
		white-space: nowrap;
		max-width: 20%;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	h2 {
		display: flex;
		gap: 10px;
		margin-top: 30px;
		align-items: center;
		justify-content: space-around;
	}

	#add {
		border: 0;
		background: cadetblue;
		border-radius: 50%;
		line-height: 0.9em;
		width: 1em;
		color: white;
		font-weight: bold;
		font-size: 40px;
		transform: translateY(3px);
		cursor: pointer;
	}
</style>
