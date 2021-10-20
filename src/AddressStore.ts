import {writable} from "svelte/store";

export type Address = {
    addressHash: string,
    balance: number
}


export const addresses = writable([]);

export function addAddress(newAddress:Address) {
    addresses.update($address => {
        $address= [...$address, newAddress];
        return $address;
    });
}

export function removeAddress(removableAddressHash:string) {
    addresses.update($address => {
        $address= $address.filter(t => t.addressHash !== removableAddressHash)
        //$address= [...$address];
        return $address;
    });

}
