<script lang="ts">
    import AddressItem from "./AddressItem.svelte";

    let currentSearch;

    const allAddressesArray = [];

    for(let i = 0; i < 10 ; i++){
        let iotaAddress = {address: Math.floor(Math.random() * 1000000000), iotaAmount: Math.floor(Math.random() * 1000000000)};
        allAddressesArray.push(iotaAddress);
    }

    function addAddress(addressNumber:number){
        let iotaAddress = {address: addressNumber, iotaAmount: Math.floor(Math.random() * 1000000000)};
        allAddressesArray.push(iotaAddress);
    }


    function handleInput(e) {
        currentSearch = e.target.value;
    }
</script>

<ion-list>

    <ion-item>
        <ion-input on:input={handleInput} placeholder="Enter Address"></ion-input>
        <ion-button on:click={() => addAddress(currentSearch)}>Enter</ion-button>
    </ion-item>

    {#each allAddressesArray as address}
        <AddressItem addressNumber= {address.address} iotaBalance={address.iotaAmount}/>
    {/each}

</ion-list>
