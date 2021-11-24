<script>
	export let name;
	export let key;
	export let course;
	export let time;
	export let date;
</script>

<h1>You got automatically registered to Volleyball!</h1>
<p>
	Hello {name}. <br />
	You got registered to the {course} Volleyball course on {date} at {time}.
</p>
<a href="https://volleyballhtwg.netlify.app/check?key={key}"> Check your registration status here</a>
<br />
<a href="https://volleyballhtwg.netlify.app/cancel?key={key}"> Cancel Registration</a>
<br>
<br>