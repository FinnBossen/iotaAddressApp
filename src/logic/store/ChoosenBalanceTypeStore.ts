import {writable} from "svelte/store";

export enum BalanceChoosingType {
    I = "i",
    KI = "Ki",
    MI = "Mi",
    GI = "Gi",
    TI = "Ti",
    PI = "Pi",
}

// the multiplier values for all the different showing formats of iota
function getMultiplier(id: BalanceChoosingType){
    switch(id) {
        case BalanceChoosingType.I: {
            return 1000000;
        }
        case BalanceChoosingType.KI: {
            return 1000;
        }
        case BalanceChoosingType.MI: {
            return 1;
        }
        case BalanceChoosingType.GI: {
            return 1 / 1000;
        }
        case BalanceChoosingType.TI: {
            return 1 / 1000000;
        }
        case BalanceChoosingType.PI: {
            return 1 / 1000000;
        }
        default: {
            return 1 / 1000000000;
        }
    }
}

// stores the current balance type that is chosen and distributes it to the components
export const chosenBalanceType = writable(BalanceChoosingType.I);

export function changeChosenBalanceType(balanceType:BalanceChoosingType){
    chosenBalanceType.set(balanceType);
}

// calculates how the number for the iota balance should be shown based on the type
export function calculateBalanceDisplay(iotaValueBalance:number,type:BalanceChoosingType){
    if(type === BalanceChoosingType.I){
        return iotaValueBalance
    }
    const miota = iotaValueBalance / getMultiplier(BalanceChoosingType.I);
    return (miota * getMultiplier(type)).toFixed(2);
}
