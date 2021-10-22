import {writable} from "svelte/store";

export type Address = {
    addressHash: string,
    balance: number
}

export const addresses = writable([]);

export function addAddress(newAddress:Address) {
    addresses.update($address => {
        for (const address of $address){
            if(address.addressHash === newAddress.addressHash){
                throw new Error('Address is already listed');
            }
        }
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

export function addBalanceToAddress(addressHash: string, balance:number){
    addresses.update($address => {
        for (const address of $address){
            if(address.addressHash === addressHash){
                const index = $address.indexOf(address);
                $address[index].balance = $address[index].balance + balance;
            }
        }
        $address= [...$address];
        return $address;
    });
}
