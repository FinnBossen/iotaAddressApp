import {writable} from "svelte/store";

export type Address = {
    addressHash: string,
    balance: number
}

// Tried to use a map but it made problems in my AddressList even when converting it to an array (maybe I am missing something)
// addresses writable that distributes the changes to all components
export const addresses = writable([]);

// Adds address to the writable array addresses
export function addAddress(newAddress:Address) {
    addresses.update($address => {
        const index = $address.findIndex((address => address.addressHash == newAddress.addressHash));
        if(index > -1){
            throw new Error('Address is already listed');
        }
        $address= [...$address, newAddress];
        return $address;
    });
}

// Removes address to the writable array addresses
export function removeAddress(removableAddressHash:string) {
    addresses.update($address => {
        $address= $address.filter(t => t.addressHash !== removableAddressHash)
        return $address;
    });
}

// Adds new Amount to address.balance, is called when mqtt amount change was triggered inside the websocket
export function addBalanceToAddress(addressHash: string, balance:number){
    addresses.update($address => {
        const index = $address.findIndex((address => address.addressHash == addressHash));
        $address[index].balance = $address[index].balance + balance;
        $address= [...$address];
        return $address;
    });
}
