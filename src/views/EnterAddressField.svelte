<script lang="ts">
    import {addAddress} from "../logic/store/AddressStore"
    import {checkBalance} from "../logic/services/IotaService";
    import {MQTTListener} from "../logic/services/MQTTWebsocketListener";


    let currentSearch;
    let showError = false;
    let errorMessage = "";

    async function enterNewAddress(){
        let balance;
        try {
            balance = await checkBalance(currentSearch);
            addAddress({addressHash:currentSearch,balance:balance});
            MQTTListener.addSubscription(currentSearch);
            currentSearch = '';
            if(showError){
                noErrorAnymore();
            }
        }catch (e){
            currentSearch = '';
            throwError(e.message)
        }
    }

    // sets back the displaying of the error
    function noErrorAnymore() {
        showError = false;
        errorMessage = '';
    }

    // changes showError so an error will be shown inside the input field
    function throwError(errorMsg:string){
        showError = true;
        errorMessage = errorMsg;
    }

</script>

<style>
    .InputButton{
        width: 100%;
        box-shadow: 0 0 3px;
        margin: 10px;
    }
    .Error{
        box-shadow: 0 0 3px #CC0000;
    }
</style>


<ion-item>
    <!-- Not using IonInput because binding does not work with custom elements https://github.com/sveltejs/svelte/issues/4838 -->
    <input class="InputButton {showError?'Error':''}"   bind:value={currentSearch} placeholder="{showError?errorMessage:'Enter Address'}">
    <ion-button size="middle"  on:click={() => enterNewAddress()}>
        <ion-icon slot="icon-only" name="add-circle-sharp"></ion-icon>
    </ion-button>
</ion-item>
