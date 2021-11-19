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
	let loading = false;

	$: isLoggedIn = store && authHelper.authenticated(store);
	$: token = store && store.getItem('id_token');
	$: role =
		store && JSON.parse(localStorage.getItem('profile'))['https://ausowa.netlify.app/role'][0];

	let headers = {};

	onMount(async () => {
		store = window.localStorage;

		await Promise.resolve();

		if (!isLoggedIn && !dev) {
			window.location.href = '/login';
		}

		headers = {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};
		await fetchCourses();
	});

	async function fetchCourses() {
		loading = true;
		const res = await fetch(server + '/courses/details', { headers }).then((r) => r.json());

		courses = res.courses || [];
		loading = false;
	}

	function showRegistrations({ detail }) {
		courseID = detail.course;
		const course = courses.find((c) => c._id === courseID);
		registrations = course.registered;
	}
	async function deleteCourse(id) {
		loading = true;
		await fetch(server + '/courses?id=' + id, { method: 'DELETE', headers }).then((r) => r.json());
		await update();
		loading = false;
	}

	async function deleteRegistaration(key) {
		loading = true;
		await fetch(server + '/registration?regKey=' + encodeURIComponent(key), {
			method: 'DELETE'
		}).then((r) => r.json());
		await update();
		loading = false;
	}

	async function createCourse({ detail }) {
		loading = true;
		await fetch(server + '/courses', {
			method: 'POST',
			body: JSON.stringify(detail),
			headers
		}).then((r) => r.json());
		await update();
		loading = false;
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
		loading = true;
		await fetchCourses();

		if (courseID) {
			showRegistrations({ detail: { course: courseID } });
		}
		loading = false;
	}

	function toggleOverlay() {
		showOverlay = !showOverlay;
	}

	function logout() {
		authHelper.logout(localStorage);
		window.location.href = '/login';
	}
</script>

{#if loading}
	<div id="overlay">
		<div class="lds-dual-ring" />
	</div>
{/if}

<div id="header">
	<a href="/"> &lt; back</a>
	<button on:click={logout}>Logout</button>
	<span class="gray"> &nbsp; Logged in as {role} </span>
</div>

<div id="columns">
	<div id="left">
		<h2>Courses <button id="add" on:click={toggleOverlay}>+</button></h2>
		{#each courses as course}
			<Course
				{course}
				selected={courseID === course._id}
				on:select={(c) => showRegistrations(c)}
				on:delete={() => deleteCourse(course._id)}
				deletable
			/>
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
	#header {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		padding: 10px;
	}
	#columns {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 90vw;
		margin: 10vw auto;
	}

	#left,
	#right {
		flex: 1 1 500px;
		max-width: 500px;
	}

	#left {
		border-right: 10px solid grey;
		padding-right: 20px;
	}

	#right {
		padding: 20px;
		display: table;
	}

	table {
		width: 100%;
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
		letter-spacing: 0.5px;
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
		z-index: 100;
	}

	.lds-dual-ring {
		display: inline-block;
		width: 80px;
		height: 80px;
	}
	.lds-dual-ring:after {
		content: ' ';
		display: block;
		width: 64px;
		height: 64px;
		margin: 8px;
		border-radius: 50%;
		border: 6px solid #fff;
		border-color: #fff transparent #fff transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}
	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
