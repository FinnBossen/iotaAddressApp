import {Writable, writable} from 'svelte/store'

export const randomStore : Writable<number> = writable(Math.random());

// randomStore.set(v => v++);

function enterAddress(addressNumber:number){

}

function removeAddress(addressNumber:number){

}
