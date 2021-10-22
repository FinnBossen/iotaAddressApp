<script lang="ts">
    import {addAddress} from "./AddressStore"
    import {checkBalance} from "./IotaService";
    import {MQTTListener} from "./MQTTWebsocketListener";


    let currentSearch;

    async function enterNewAddress(){
        let balance;
        // try catch needs to be different
        try {
           balance = await checkBalance(currentSearch);
        }catch (e){
            alert("Could not find Address");
        }
        try {
            addAddress({addressHash:currentSearch,balance:balance})
            MQTTListener.addSubscription(currentSearch)
            currentSearch = '';
        }catch (e){
            alert(e);
        }
    }
</script>

<style>
    .InputButton{
        width: 100%;
    }
</style>



<ion-item>
    <!-- Not using IonInput because binding does not work with custom elements https://github.com/sveltejs/svelte/issues/4838 -->
    <input class="InputButton" bind:value={currentSearch} placeholder="Enter Address"/>
    <ion-button size="middle"  on:click={() => enterNewAddress()}>
        <ion-icon slot="icon-only" name="add-circle-sharp"></ion-icon>
    </ion-button>
</ion-item>
