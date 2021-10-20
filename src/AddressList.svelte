
<script lang="ts">
    import AddressItem from "./AddressItem.svelte";
    import {addAddress, addresses, removeAddress} from './AddressStore';

    let allAddressesArray = [];

    for (let i = 0; i < 1; i++) {

        addAddress({addressHash:'dsad',balance:1212});
        /*
        let iotaAddress = {
            address: Math.floor(Math.random() * 1000000000),
            iotaAmount: Math.floor(Math.random() * 1000000000)
        };
        allAddressesArray.push(iotaAddress);
         */
    }

    function removeItem(hashAddress){
        removeAddress(hashAddress);
        //allAddressesArray = allAddressesArray.filter(t => t.address !== hashAddress)
    }
    /*
        function addAddress() {
                let iotaAddress = {address: currentSearch, iotaAmount: Math.floor(Math.random() * 1000000000)};
                allAddressesArray = [...allAddressesArray, iotaAddress];
                currentSearch = '';
        }
    */
    /*
        async function getInfo() {
            const info = await IotaNodeClient.info();
            console.log("Node Info");
            console.log("\tName:", info.name);
            console.log("\tVersion:", info.version);
            console.log("\tIs Healthy:", info.isHealthy);
            console.log("\tNetwork Id:", info.networkId);
            console.log("\tLatest Milestone Index:", info.latestMilestoneIndex);
            console.log("\tConfirmed Milestone Index:", info.confirmedMilestoneIndex);
            console.log("\tPruning Index:", info.pruningIndex);
            console.log("\tFeatures:", info.features);
            console.log("\tMin PoW Score:", info.minPoWScore);
        }

     */

</script>


<ion-list>



    {#each $addresses as address}
        <AddressItem on:remove={e => removeItem(e.detail) } addressHash={address.addressHash} iotaBalance={address.balance}/>
    {/each}

</ion-list>
