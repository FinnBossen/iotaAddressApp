<script lang="ts">
    import AddressItem from "./AddressItem.svelte";
    import {addresses} from "../logic/store/AddressStore";
</script>


<ion-list>
    {#each $addresses as address}
        <AddressItem addressHash={address.addressHash} iotaBalance={address.balance}/>
    {/each}
</ion-list>
