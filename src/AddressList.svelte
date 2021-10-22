
<script lang="ts">
    import AddressItem from "./AddressItem.svelte";
    import {addAddress, addresses, removeAddress} from "./AddressStore";


    for (let i = 0; i < 1; i++) {
        try {
            addAddress({addressHash:'dsad',balance:1212});
        }catch (e){
            alert(e);
        }
    }

    function removeItem(hashAddress){
        removeAddress(hashAddress);
    }
</script>


<ion-list>

    {#each $addresses as address}
        <AddressItem on:remove={e => removeItem(e.detail) } addressHash={address.addressHash} iotaBalance={address.balance}/>
    {/each}

</ion-list>
