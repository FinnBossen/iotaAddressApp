<script lang="ts">
    import {calculateBalanceDisplay, chosenBalanceType} from "../logic/store/ChoosenBalanceTypeStore";
    import {MQTTListener} from "../logic/services/MQTTWebsocketListener";
    import {removeAddress} from "../logic/store/AddressStore";

    export let addressHash: string = '';
    export let iotaBalance: number = 0;
    let onUpdate = false;
    let lastHash: string;

    function remove() {
        console.log("removing address: " + addressHash)
        MQTTListener.removeSubscription(addressHash)
        removeAddress(addressHash);
    }

    // listens to balance changes
    $: {
        onBalanceChanged(iotaBalance);
    }

    // changed the color to blue for a short time when value changes
    function onBalanceChanged(newBalance) {
        // gets updates out of the way that happen while parsing the values again when deleting address in list
        if (lastHash !== addressHash) {
            lastHash = addressHash;
            return;
        }
        console.log("Balance from address " + addressHash + " changed to " + newBalance);
        onUpdate = true;
        setTimeout(() => {
            onUpdate = false;
        }, 1000);
    }

</script>
<ion-item-sliding>
    <ion-item>
        <ion-label class="ion-text-center"> {addressHash} </ion-label>
        <ion-label color="{onUpdate?'tertiary':''}"
                   class="ion-text-center"> {calculateBalanceDisplay(iotaBalance, $chosenBalanceType)} {$chosenBalanceType}</ion-label>
    </ion-item>
    <ion-item-options side="end">
        <ion-item-option color="danger" on:click={() => remove()}>Delete</ion-item-option>
    </ion-item-options>
</ion-item-sliding>
