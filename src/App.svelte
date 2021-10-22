<script lang="ts">
	import AddressList from "./AddressList.svelte";
	import EnterAddressField from "./EnterAddressField.svelte";
	import {onMount} from "svelte";
	import {checkHealth, checkInfo} from "./IotaService";

	export let name: string;



	const greet = () => alert('hi');

	onMount(async ()=>{
		// checks health and info of Iota connection
		console.log(await checkHealth() ? "Connected successfully with iota dev network" : "Problems with connecting to iota dev network");
		await checkInfo();
	})

</script>

<main>
	<ion-app>
		<ion-content>
			<ion-header>
				<ion-toolbar>
					<ion-title>{name}</ion-title>
				</ion-toolbar>
			</ion-header>
			<EnterAddressField/>
			<AddressList/>
		</ion-content>
		<ion-footer>
			<ion-button color="secondary" expand="block" on:click={greet}>
				Greet
			</ion-button>
		</ion-footer>
	</ion-app>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

