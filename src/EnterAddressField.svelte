<script lang="ts">
    import {addAddress} from "./AddressStore"

    let currentSearch;

    async function enterNewAddress(){
        addAddress({addressHash:currentSearch,balance:1212})
        currentSearch = '';
    }



    /*
    Iota.setLogger(consoleLog);
    const client = new Iota.SingleNodeClient("https://chrysalis-nodes.iota.org/");
    const health = await client.health();
    consoleLog("Is the node healthy", health ? "Yes" : "No");
    consoleLog();

    const info = await client.info();
    consoleLog("Node Info");
    Iota.logInfo("", info);
    consoleLog();

    const tipsResponse = await client.tips();
    consoleLog("Tips");
    Iota.logTips("", tipsResponse);
    consoleLog();
    const address = await client.addressEd25519(output.output.address.address);
    consoleLog("Address");
    consoleLog("\tAddress:", address.address);
    consoleLog("\tBalance:", address.balance);

    */
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
