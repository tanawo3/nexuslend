import { getGenLayerClient } from '../utils/networkConfig';

export const deployNewContract = async (code: string, address: string) => {
  try {
    const client = getGenLayerClient('studionet', address);
    
    console.log("Deploying contract...");
    const hash = await client.deployContract({
      code,
      args: []
    });
    
    const types = await import('genlayer-js/types');
    const receipt = await client.waitForTransactionReceipt({
      hash: hash as any,
      status: types.TransactionStatus.ACCEPTED
    });
    
    const newAddr = receipt.data.contract_address as string;
    console.log("Deployed successfully at:", newAddr);
    
    // Save to localStorage for useGenLayer to pick up
    localStorage.setItem('nexuslend_contract_v1', newAddr);
    localStorage.setItem('GLOBAL_CONTRACT_ADDRESS', newAddr);
    
    // Slight delay to allow chain indexing
    await new Promise(resolve => setTimeout(resolve, 2000));
    window.location.reload();
  } catch (error: any) {
    console.error("Failed to deploy contract:", error);
    alert("Failed to deploy: " + error?.message);
  }
};
