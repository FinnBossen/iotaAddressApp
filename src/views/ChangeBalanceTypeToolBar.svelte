<script lang="ts">
    import {
        BalanceChoosingType,
        changeChosenBalanceType,
        chosenBalanceType
    } from "../logic/store/ChoosenBalanceTypeStore";
</script>
<!-- The Buttons where the balance showing type can be changed (Iota, Kiota, Miota...) --->
<ion-toolbar>
    <ion-button color={$chosenBalanceType === BalanceChoosingType.I ? "primary" : "secondary"}
                on:click={()=>changeChosenBalanceType(BalanceChoosingType.I)}>
        &nbsp;i&nbsp;
    </ion-button>
    <ion-button color={$chosenBalanceType === BalanceChoosingType.KI ? "primary" : "secondary"}
                on:click={()=>changeChosenBalanceType(BalanceChoosingType.KI)}>
        Ki
    </ion-button>
    <ion-button color={$chosenBalanceType === BalanceChoosingType.MI ? "primary" : "secondary"}
                on:click={()=>changeChosenBalanceType(BalanceChoosingType.MI)}>
        Mi
    </ion-button>
    <ion-button color={$chosenBalanceType === BalanceChoosingType.GI ? "primary" : "secondary"}
                on:click={()=>changeChosenBalanceType(BalanceChoosingType.GI)}>
        Gi
    </ion-button>
    <ion-button color={$chosenBalanceType === BalanceChoosingType.TI ? "primary" : "secondary"}
                on:click={()=>changeChosenBalanceType(BalanceChoosingType.TI)}>
        Ti
    </ion-button>
    <ion-button color={$chosenBalanceType === BalanceChoosingType.PI ? "primary" : "secondary"}
                on:click={()=>changeChosenBalanceType(BalanceChoosingType.PI)}>
        Pi
    </ion-button>
</ion-toolbar>
