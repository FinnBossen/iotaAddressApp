<script lang="ts">
    export let addressNumber : number;
    export let iotaBalance : number;

    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher()

    function remove() {

    }

</script>

<ion-item-sliding>
    <ion-item>
        <ion-label>{addressNumber} {iotaBalance}</ion-label>
    </ion-item>
    <ion-item-options side="end">
        <ion-item-option on:click={() => remove()}>Unread</ion-item-option>
    </ion-item-options>
</ion-item-sliding>
