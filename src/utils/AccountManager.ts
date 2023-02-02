import { Account, AccountKey, Accounts } from "./storage/entities/Accounts";
import Keyring from "./storage/entities/Keyring";
import Vault from "./storage/entities/Vault";
import Storage from "./storage/Storage";
import { ethers } from "ethers";
import { ACCOUNT_PATH } from "./constants";
import PolkadotKeyring from "@polkadot/ui-keyring";
import Auth from "./storage/Auth";

export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
  IMPORTED_EVM = "IMPORTED_EVM",
  IMPORTED_WASM = "IMPORTED_WASM",
}

export default class AccountManager {
  static async addEVMAccount(
    seed: string,
    name: string,
    path?: string,
    keyring?: Keyring
  ): Promise<Account> {
    const type = AccountType.EVM;
    const { address, privateKey } =
      ethers.Wallet.fromMnemonic(seed, path || ACCOUNT_PATH) || {};
    const key = AccountManager.formatAddress(address, type);
    const _keyring = keyring || new Keyring(key, type, seed, privateKey);
    return AccountManager.addAccount(address, type, name, _keyring);
  }

  static async addWASMAccount(seed: string, name: string, keyring?: Keyring) {
    const type = AccountType.WASM;
    const wallet = PolkadotKeyring.addUri(seed, Auth.password);
    const { address } = wallet.json || {};
    const privateKey = wallet.pair.meta.privateKey?.toString() || "";
    console.log("privateKey", privateKey);
    const key = AccountManager.formatAddress(address, type);
    const _keyring = keyring || new Keyring(key, type, seed, privateKey);
    return AccountManager.addAccount(address, type, name, _keyring);
  }

  static async addAccount(
    address: string,
    type: AccountType,
    name: string,
    keyring: Keyring
  ) {
    const key = AccountManager.formatAddress(address, type);
    const value = { name, address, keyring: key };
    const account = new Account(key, value);
    await AccountManager.saveAccount(account);
    await AccountManager.saveKeyring(keyring);
    return account;
  }

  private static async getImportedEVMAddress(privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    const { address } = wallet || {};
    const seed = wallet.mnemonic?.phrase || "";
    return { address, privateKey, seed };
  }

  private static async getImportedWASMAddress(seed: string) {
    const wallet = PolkadotKeyring.addUri(seed, Auth.password);
    const { address } = wallet.json || {};
    const privateKey = wallet.pair.meta.privateKey?.toString() || "";
    return { address, seed, privateKey };
  }

  static async importAccount({
    name,
    privateKeyOrSeed,
    accountType,
  }: {
    name: string;
    privateKeyOrSeed: string;
    accountType: AccountType;
  }) {
    let type: AccountType.IMPORTED_EVM | AccountType.IMPORTED_WASM;
    let importedData;
    switch (accountType) {
      case AccountType.EVM:
        importedData = await AccountManager.getImportedEVMAddress(privateKeyOrSeed);
        type = AccountType.IMPORTED_EVM;
        break;
      case AccountType.WASM:
        importedData = await AccountManager.getImportedWASMAddress(privateKeyOrSeed);
        type = AccountType.IMPORTED_WASM;
        break;
      default:
        throw new Error("Invalid account type");
    }
    const { address, privateKey, seed } = importedData;
    const key = AccountManager.formatAddress(address, type);
    const keyring = new Keyring(key, type, seed, privateKey);
    return AccountManager.addAccount(address, type, name, keyring);
  }

  static async derive(name: string, vault: Vault, type: AccountType) {
    const keyring = await vault.getKeyringsByType(type);
    if (!keyring) throw new Error("Keyring not found");
    keyring.increaseAccountQuantity();
    let path;
    switch (type) {
      case AccountType.EVM:
        path = keyring.path.slice(0, -1) + keyring.accountQuantity;
        return AccountManager.addEVMAccount(keyring.seed, name, path, keyring);
      case AccountType.WASM:
        path = `${keyring.path}/${keyring.accountQuantity}`;
        return AccountManager.addWASMAccount(keyring.seed, name, keyring);
      default:
        throw new Error("Invalid account type");
    }
  }

  static formatAddress(address: string, type: AccountType): AccountKey {
    if (
      address.startsWith("WASM") ||
      address.startsWith("EVM") ||
      address.startsWith("IMPORTED")
    ) {
      return address as AccountKey;
    }
    return `${type}-${address}`;
  }

  static async saveAccount(account: Account) {
    await Storage.getInstance().addAccount(account);
  }

  static async saveKeyring(keyring: Keyring) {
    await Storage.getInstance().saveKeyring(keyring);
  }

  static async getAccount(key: AccountKey): Promise<Account | undefined> {
    if (!key) throw new Error("Account key is required");
    return Storage.getInstance().getAccount(key);
  }

  static async changeName(key: AccountKey, newName: string) {
    const account = await AccountManager.getAccount(key);
    if (!account) throw new Error("Account not found");
    account.value.name = newName;
    Storage.getInstance().updateAccount(account);
  }

  static async forget(key: AccountKey) {
    Storage.getInstance().removeAccount(key);
  }

  static async showPrivateKey(): Promise<string | undefined> {
    const selectedAccount = await Storage.getInstance().getSelectedAccount();
    if (!selectedAccount) return undefined;
    const vault = await Storage.getInstance().getVault();
    if (!vault) throw new Error("Vault not found");
    return vault?.keyrings[selectedAccount.key]?.privateKey;
  }

  static async getAll(): Promise<Accounts | undefined> {
    const accounts = await Storage.getInstance().getAccounts();
    if (!accounts) return undefined;
    return accounts;
  }
}