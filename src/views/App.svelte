<script lang="ts">
    import AddressList from "./AddressList.svelte";
    import EnterAddressField from "./EnterAddressField.svelte";
    import {onMount} from "svelte";
    import {checkHealth, checkInfo} from "../logic/services/IotaService";
    import ChangeBalanceType from "./ChangeBalanceTypeToolBar.svelte";

    export let name: string;

    onMount(async () => {
        // checks health and info of Iota connection
        await checkHealth();
        await checkInfo();
    })

</script>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>

<main>
    <ion-app>
        <ion-content>
            <ion-header>
                <ion-toolbar>
                    <ion-title>{name}</ion-title>
                </ion-toolbar>
            </ion-header>
            <EnterAddressField/>
            <ion-item>
                <ion-label class="ion-text-center"> Address</ion-label>
                <ion-label class="ion-text-center"> Balance</ion-label>
            </ion-item>
            <AddressList/>
        </ion-content>
        <ion-footer>
            <ChangeBalanceType/>
        </ion-footer>
    </ion-app>
</main>

