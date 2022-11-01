<script>
	import { dev } from '$app/env';
	import { goto } from '$app/navigation';
	import { server } from '../helpers/env';
	import { onMount } from 'svelte';
	import authHelper from '../helpers/auth-helper';
	import Course from '../components/course.svelte';
	import CourseCreator from '../components/createCourse.svelte';

	let store;
	let courses = [];
	let courseID;
	let registrations = [];
	let strikes = [];
	let showOverlay = false;
	let loading = false;
	let preRegisterName = '';

	$: isLoggedIn = store && authHelper.authenticated(store);
	$: token = store && store.getItem('id_token');
	$: role =
		store && JSON.parse(localStorage.getItem('profile'))['https://ausowa.netlify.app/role'][0];

	let headers = {};

	onMount(async () => {
		store = window.localStorage;

		await Promise.resolve();

		if (!isLoggedIn && !dev) {
			await goto('/login');
		}

		headers = {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};

		// const auth = await fetch(server + '/auth/check', { headers })
		// 	.then((res) => res.ok)
		// 	.catch(() => false);

		// if (!auth && !dev) {
		// 	logout();
		// }

		await fetchCourses();
	});

	async function fetchCourses(load = true) {
		loading = load;
		
		const res = await fetch(server + '/courses/details', { headers }).then((r) => r.json());
		courses = res.courses || [];

		const res2 = await fetch(server + '/strikes', { headers }).then((r) => r.json());
		strikes = res2.strikes || [];

		loading = false;
	}

	function showRegistrations({ detail }) {
		courseID = detail.course;
		const course = courses.find((c) => c._id === courseID);
		registrations = course?.registered ?? [];
		fetchCourses(false);
	}
	async function deleteCourse(id) {
		if (!confirm('Are you sure you want to delete the course?')) {
			return;
		}
		loading = true;
		await fetch(server + '/courses?id=' + id, { method: 'DELETE', headers }).then((r) => r.json());
		await update();
		loading = false;
	}

	async function deleteRegistaration(key) {
		if (!confirm('Are you sure you want to cancel the registration?')) {
			return;
		}

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

	function copy() {
		const course = courses.find((c) => c._id === courseID);

		const waitlist = course.registered
			.filter((r) => r.waitlist)
			.map((r, i) => `#${i + 1}: ${r.name.trim()}`);

		let regs = `*${course.name}:*\n${course.registered
			.filter((r) => !r.waitlist)
			.map((r) => r.name.trim())
			.sort((a, b) => a.localeCompare(b))
			.join(',\n')}`;

		if (waitlist.length > 0) {
			regs += `\n_Warteliste:_\n${waitlist.join(',\n')}`;
		}

		navigator.clipboard.writeText(regs);
	}

	async function preregister() {
		if (!preRegisterName || !courseID) {
			return;
		}
		loading = true;
		await fetch(server + '/registration', {
			method: 'POST',
			body: JSON.stringify({ name: preRegisterName, course: courseID }),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		}).then((j) => j.json());
		await update();
	}

	async function toggleStrike(key) {
		if (!confirm('Are you sure you want to add/remove a strike?')) {
			return;
		}
		loading = true;
		await fetch(server + '/registration/clear-strike?regKey=' + encodeURIComponent(key), {headers}).then((j) => j.json());
		await update();
	}

	function logout() {
		authHelper.logout(localStorage);
		goto('/login');
	}
</script>

{#if loading}
	<div id="overlay">
		<div class="lds-dual-ring" />
	</div>
{/if}

<div id="header">
	<a href="/">&lt; back</a>
	<button on:click={logout}>Logout</button>
	<span class="gray">&nbsp; Logged in as {role}</span>
</div>

<div id="columns">
	<div id="left">
		<h2>
			Courses
			<button id="add" on:click={toggleOverlay}>+</button>
		</h2>
		{#each courses as course}
			<Course
				{course}
				selected={courseID === course._id}
				on:select={(c) => showRegistrations(c)}
				on:delete={() => deleteCourse(course._id)}
				deletable
				fullDate
				showPublishDate
			/>
		{/each}
	</div>
	<div id="right">
		{#if registrations}
			<h2>Registrations <button id="copy" on:click={copy}>Copy</button></h2>
			{#if courseID}
				<div id="preregister">
					<label
						>Add Registration:
						<input type="text" bind:value={preRegisterName} />
					</label>
					<button on:click={preregister}>></button>
				</div>
			{/if}
			<table>
				{#each registrations as reg, idx}
					<div class="registration" class:waitlist={reg.waitlist}>
						<span> {idx + 1} </span>
						<span>
							<b>{reg.name}</b>
						</span>
						<span>{format(reg.registered)}</span>
						<span class="gray"
							>{reg.key}
							{#if reg.email}
								<i>✉</i>
							{/if}
						</span>
						<span>
							<button class="strikeBtn" on:click={() => toggleStrike(reg.key)}>
								{#if reg.suspectedStrike}
									Strike User
								{:else}
									Remove Strike
								{/if}
							</button>
							<button class="registrationButton" on:click={() => deleteRegistaration(reg.key)}>
								Cancel
							</button>
						</span>
					</div>
				{/each}
			</table>
		{:else}Select a course.{/if}
	</div>

	{#each strikes as strike}
		<div>
			<span>{strike.name} </span>
			<span>format({strike.date}) </span>
		</div>
	{/each}
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
	#header > button {
		border: 0;
		padding: 0.2em 1.5em;
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

	.registrationButton,
	#copy {
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

	#preregister {
		display: flex;
		justify-content: space-around;
		margin-bottom: 1em;
	}
	#preregister label input {
		flex: 1 1 40%;
		max-width: 40%;
	}
	#preregister button {
		border: 0;
		padding: 0.2em 1.5em;
	}
	#preregister label {
		display: flex;
		justify-content: space-between;
		width: 90%;
	}
</style>
