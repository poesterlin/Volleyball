<script>
	import { server } from '../helpers/env';
	import { onMount } from 'svelte';
	import authHelper from '../helpers/auth-helper';
	import Course from '../components/course.svelte';

	let store;
	let courses = [];
	let courseID;
	let registrations = [];

	$: isLoggedIn = store && authHelper.authenticated(store);
	$: token = 'test' + Math.random() || (store && store.getItem('id_token'));

	onMount(async () => {
		store = window.localStorage;

		const res = await fetch(server + '/course/details', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((r) => r.json());

		courses = res.courses;
	});

	function showRegistrations({ detail }) {
		courseID = detail.course;
		const course = courses.find((c) => c._id === courseID);
		registrations = course.registered;
	}
	async function deleteCourse() {
		const res = await fetch(server + '/course/delete', {
			method: 'POST',
			body: JSON.stringify({ id: courseID }),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		}).then((r) => r.json());
		console.log(res);
	}
	async function deleteRegistaration(key) {
		const res = await fetch(server + '/registration?regKey=' + key, {
			method: 'DELETE'
		}).then((r) => r.json());
		console.log(res);
	}

	async function createCourse() {
		const res = await fetch(server + '/course/new', {
			method: 'POST',
			body: JSON.stringify({
				name: 'test',
				location: 'test',
				spots: 4,
				time: '20:30',
				duration: 2,
				date: new Date()
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		}).then((r) => r.json());
		console.log(res);
	}

	function format(date) {
		return new Intl.DateTimeFormat('de', {
			month: 'numeric',
			day: 'numeric',
			minute: 'numeric',
			hour: 'numeric'
		}).format(new Date(date));
	}
</script>

{#if !isLoggedIn}
	<a href="/login">Login first</a>
{/if}

<h2>Courses:</h2>
<button on:click={createCourse}>create course</button>
<br />
<br />
<br />
<div id="columns">
	<div id="left">
        <h2>Courses:</h2>
		<button on:click={deleteCourse} disabled={!courseID}>Delete</button>
		{#each courses as course}
			<Course {course} selected={courseID === course._id} on:select={(c) => showRegistrations(c)} />
		{/each}
	</div>
	<div id="right">
		{#if registrations}
			<h2>Registrations:</h2>
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
		{:else}
			Select a course.
		{/if}
	</div>
</div>

<style>
	#columns {
		display: flex;
		justify-content: space-between;
		gap: 10px;
	}

	#left,
	#right {
		flex: 1 1 calc(50% - 6px);
	}

	#right {
		padding: 20px;
		background: gray;
		display: table;
		width: 100%;
        color: white;
	}

	.waitlist {
		background: rgba(255, 0, 0, 0.267);
	}

	.registration {
		color: white;
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
</style>
