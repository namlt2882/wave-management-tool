const secretVault = {};

export const addToSecretVault = (name, str = "") => {
  const privateKeys = str.split("\n").map((s) => s.trim());
  secretVault[name] = privateKeys.map((privateKey) => {
    const privateKeyBytes = Uint8Array.from(
      Buffer.from(privateKey.slice(2), "hex")
    );

    const keypair = fromExportedKeypair({
      schema: "ED25519",
      privateKey: toB64(privateKeyBytes),
    });
    return keypair;
  });
};

export const getKeypairFromSecretVault = (name) => {
  return secretVault[name];
};
