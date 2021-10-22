import Iota from "@iota/iota.js";

const client = new Iota.SingleNodeClient("https://api.lb-0.h.chrysalis-devnet.iota.cafe/");

export async function checkHealth(){
    const health = await client.health();
    return health ? "Yes" : "No";
}

export async function checkInfo(){
    const info = await client.info();
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

export async function checkBalance(addressHash:string) {
    const address = await client.address(addressHash);
    console.log("Address");
    console.log("\tAddress:", address.address);
    console.log("\tBalance:", address.balance);
    return address.balance;
}

