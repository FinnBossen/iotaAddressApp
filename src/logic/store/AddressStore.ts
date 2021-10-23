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
    addresses.update($addresses => {
        const index = $addresses.findIndex((address => address.addressHash == newAddress.addressHash));
        if(index > -1){
            throw new Error('Address is already listed');
        }
        $addresses= [...$addresses, newAddress];
        return $addresses;
    });
}

// Removes address to the writable array addresses
export function removeAddress(removableAddressHash:string) {
    addresses.update($addresses => {
        $addresses= $addresses.filter(t => t.addressHash !== removableAddressHash)
        return $addresses;
    });
}

// Adds new Amount to address.balance, is called when mqtt amount change was triggered inside the websocket
export function addBalanceToAddress(addressHash: string, balance:number){
    addresses.update($addresses => {
        const index = $addresses.findIndex((address => address.addressHash == addressHash));
        $addresses[index].balance = $addresses[index].balance + balance;
        $addresses= [...$addresses];
        return $addresses;
    });
}
