"use client";

import { useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { formatEther, parseEther } from "viem";
import { Button, Text, Flex, useToast } from "@chakra-ui/react";
import { contractAddress, abi, whitelisted } from "@/constants";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import { useState, useEffect } from "react";

const Mint = () => {
  const toast = useToast();

  const [proof, setProof] = useState([]);

  const { address, isConnected } = useAccount();

  // Mint
  // Prepare the transaction
  const { config: configMint } = usePrepareContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: "whitelistMint",
    args: [address, 1, proof],
    value: parseEther("0.1"),
    enabled: true,
    account: address,
    onError(e) {
      toast({
        title: "Error.",
        description: "Are you whitelisted ?",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess() {
      console.log("Preparing Mint...");
    },
  });

  // Get the write function
  const { data: dataMint, write: writeMint, error: mintWriteError } = useContractWrite(configMint);

  const { isLoading: isLoadingMint, isSuccess: isSuccessMint } = useWaitForTransaction({
    hash: dataMint?.hash,
    async onSuccess(dataMint) {
      toast({
        title: "Congratulations.",
        description: "Mint was successfull.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    },
    onError() {
      console.log("erreur");
    },
  });

  useEffect(() => {
    if (isConnected) {
      // Génération de la Merkle Proof
      const leaves = whitelisted.map((x) => keccak256(x.address));
      // (2) Build the Merkle Tree, specifying to sort leaves and pairs
      const tree = new MerkleTree(leaves, keccak256, { sort: true });
      // (3) Get the resultant root, and print it
      const root = tree.getHexRoot();
      console.log("Root = ");
      console.log(root);

      setProof([root]);
    }
  }, [address]);

  function handleMintClick() {
    console.log("clik !");
    console.log(writeMint);
    writeMint?.();
  }

  return (
    <Flex alignItems="center" justifyContent="center" height="85vh" width="100%">
      {isConnected ? (
        <Button disabled={!writeMint || isLoadingMint} colorScheme="whatsapp" onClick={() => handleMintClick()}>
          {isLoadingMint ? "Minting..." : "Mint"}
        </Button>
      ) : (
        <Text>Please connect your Wallet to our DApp.</Text>
      )}
    </Flex>
  );
};

export default Mint;
