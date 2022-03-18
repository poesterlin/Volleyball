<script lang="ts">
	import { goto } from '$app/navigation';
    import { onMount } from "svelte";
    let hide = true;

    onMount(()=>{
        const state = window.localStorage.getItem("hideShamelessPlug1");
        if(state !== "true"){
            const ts = parseInt(state);
            hide = Date.now() < ts;
        }
    })

    function hideUntil(){
        window.localStorage.setItem("hideShamelessPlug1", Date.now() + 30 * 60 * 1000 + ""); // ignore for 30 minutes
        hide = true;
    }

    function gotoStudy(){
        hideUntil();
        goto("/studie");
    }

    function setFlag(){
        window.localStorage.setItem("hideShamelessPlug1", "true");
        hide = true;
    }
</script>

<style>
    div#background {
        position: fixed;
        display: flex;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.15);
        z-index: 10000;
    }

    div#center{
        min-width: 290px;
        max-width: min(80vw, 400px);
        background: white;
        display: flex;
        flex-wrap: wrap;
        align-self: center;
        margin: auto;
        padding: 2em;
        padding-bottom: 0;
        border-radius: 40px;
        box-shadow: 5px 17px 5px rgba(0, 0, 0, 0.4);
    }

    h1{
        flex: 1 1 100%;
        text-align: center;
    }

    img{
        flex: 1 1 100%;
        width: 100%;
        max-height: 30vh;
        margin: 15px -2em;
        object-fit: cover;
    }

    .clickable{
        cursor: pointer;
        padding: 1em 2em;
        margin: 10px 0;
        border: 0;
        text-decoration: none;
        background: none;
        justify-self: flex-end;
    }

    #hide{
        color: gray;
        text-align: left;
    }
    
    .button{
        flex: 1 1 100%;
        width: 100%;
        text-align: center;
        font-size: 16px;
        margin-left: 20%;
    }

    .light{
        background: #ECECEC;
    }

    .dark{
        background: #4C4747;
        color: #27d6cb;
    }
</style>

{#if !hide}
    <div id="background">
        <div id="center">
            <h1>Ich brauche deine Hilfe!</h1>
            <img src="me.webp" alt="me">
            <button on:click={gotoStudy} class="clickable button dark">Philip bei seiner Studie helfen</button>
            <button on:click={hideUntil} class="clickable button light">Vielleicht nächstes mal</button>
            <button id="hide" on:click={setFlag} class="clickable">Nicht mehr fragen</button>
        </div>
    </div>

{/if}