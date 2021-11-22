<script>
	export let name;
	export let key;
	export let course;
	export let time;
	export let date;
</script>

<h1>A spot opened up for you!</h1>
<p>
	Hello {name}. <br />
	Someone canceled their registration for the {course} Volleyball course on {date} at {time}.
</p>
<a href="https://volleyballhtwg.netlify.app/check?key={key}"> Check your Registration here</a>
<a href="https://volleyballhtwg.netlify.app/cancel?key={key}"> Cancel Registration</a>
