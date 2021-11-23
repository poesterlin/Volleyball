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
<a href="https://volleyballhtwg.netlify.app/check?key={key}"> Check your registration status here</a>
<br />
<a href="https://volleyballhtwg.netlify.app/cancel?key={key}"> Cancel Registration</a>
<br>
<br>
<small>Your Email information was deleted after sending this update. You will not recive any more updates after this one time information.</small>
<br>
<br>
<br>
<b>
	<a href="mailto:test@test.com">File a complaint</a>
</b>