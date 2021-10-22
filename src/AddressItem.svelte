<script lang="ts">

    import {checkHealth, checkInfo} from "./IotaService";

    export let addressHash : string;
    export let iotaBalance : number;

    import {createEventDispatcher} from 'svelte';
    import {MQTTListener} from "./MQTTWebsocketListener";

    const dispatch = createEventDispatcher()

    async function remove() {
        console.log("removing" + addressHash)
        MQTTListener.removeSubscription(addressHash)
        dispatch('remove', addressHash)
    }

</script>

<ion-item-sliding>
    <ion-item>
        <ion-label>{addressHash} </ion-label>
        <ion-label> {iotaBalance} </ion-label>
    </ion-item>
    <ion-item-options side="end">
        <ion-item-option on:click={() => remove()}>Unread</ion-item-option>

    </ion-item-options>
</ion-item-sliding>
