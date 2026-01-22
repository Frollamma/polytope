#!/usr/bin/env node
import { Command } from "commander";
import { HDNodeWallet, Mnemonic } from "ethers";
import { randomBytes } from "crypto";

const program = new Command();

program
  .name("polytope")
  .description(
    "Stateless offline HD wallet CLI for BIP-39 / BIP-44 key derivation.",
  )
  .version(process.env.npm_package_version ?? "0.0.0");

program
  .command("gen-mnemonic")
  .description("Generate a random BIP-39 mnemonic")
  .option("--words <number>", "Number of words (12,15,18,21,24)", "12")
  .action((opts) => {
    const words = parseInt(opts.words, 10);

    if (![12, 15, 18, 21, 24].includes(words)) {
      console.error("Invalid word count");
      process.exit(1);
    }

    // Because of BIP-39 format
    const entropyBytes = (words / 3) * 4;
    const entropy = randomBytes(entropyBytes);

    const mnemonic = Mnemonic.fromEntropy(entropy);

    console.log(mnemonic.phrase);
  });

program
  .command("derive")
  .description("Derive Ethereum address from mnemonic and path")
  .requiredOption("--mnemonic <phrase>", "BIP-39 mnemonic")
  .option("--account <number>", "Account number", "0")
  .option("--change <number>", "Change (usually 0 for Ethereum)", "0")
  .option("--index <number>", "Address index", "0")
  .action((opts) => {
    const account = parseInt(opts.account, 10);
    const change = parseInt(opts.change, 10);
    const index = parseInt(opts.index, 10);

    if ([account, change, index].some(Number.isNaN)) {
      console.error("Account, change, and index must be integers");
      process.exit(1);
    }

    const path = `m/44'/60'/${account}'/${change}/${index}`;

    const wallet = HDNodeWallet.fromPhrase(
      opts.mnemonic,
      undefined, // no passphrase
      path,
    );

    console.log("Derivation path:");
    console.log(path);
    console.log();

    console.log("Address:");
    console.log(wallet.address);
    console.log();

    console.log("Private key:");
    console.log(wallet.privateKey);
  });

program.parse(process.argv);
