"use strict";
class Bank {
    constructor() {
        this.accountManager = new AccountManager();
    }
    static getInstance() {
        if (!Bank.instance) {
            Bank.instance = new Bank();
        }
        return Bank.instance;
    }
    getAccountManager() {
        return this.accountManager;
    }
}
class BankAccount {
    get balance() {
        return this._balance;
    }
    get owner() {
        return this._owner;
    }
    set owner(value) {
        this._owner = value;
    }
    constructor(owner, balance, currency) {
        this.transactions = [];
        this.accountNumber = this.generateAccountNumber();
        this._balance = balance;
        this._owner = owner;
        this.currency = currency;
    }
    deposit(amount) {
        if (amount <= 0) {
            console.error("Deposit amount must be positive");
            return;
        }
        this._balance += amount;
        this.transactions.push(`Deposit: +${amount} ${this.currency}`);
    }
    withdraw(amount) {
        if (amount > this._balance) {
            console.error("Insufficient funds");
            return;
        }
        this._balance -= amount;
        this.transactions.push(`Withdraw: -${amount} ${this.currency}`);
    }
    getTransactionHistory() {
        return this.transactions;
    }
    generateAccountNumber() {
        return `ACC-${Math.floor(Math.random() * 10000)}`;
    }
}
class AccountManager {
    constructor() {
        this.accounts = new Map();
    }
    createAccount(owner, balance, currency) {
        const account = new BankAccount(owner, balance, currency);
        this.accounts.set(account.accountNumber, account);
        return account;
    }
    closeAccount(accountNumber) {
        this.accounts.delete(accountNumber);
    }
    getAccount(accountNumber) {
        return this.accounts.get(accountNumber);
    }
}
class Client {
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    constructor(firstName, lastName) {
        this.accounts = new Map();
        this.firstName = firstName;
        this.lastName = lastName;
    }
    createAccount(balance, currency) {
        const account = Bank.getInstance().getAccountManager().createAccount(this, balance, currency);
        this.accounts.set(account.accountNumber, account);
        return account;
    }
    getAccounts() {
        return Array.from(this.accounts.values());
    }
}
class DepositCommand {
    constructor(account, amount) {
        this.account = account;
        this.amount = amount;
    }
    execute() {
        this.account.deposit(this.amount);
    }
    undo() {
        this.account.withdraw(this.amount);
    }
}
class WithdrawCommand {
    constructor(account, amount) {
        this.account = account;
        this.amount = amount;
    }
    execute() {
        this.account.withdraw(this.amount);
    }
    undo() {
        this.account.deposit(this.amount);
    }
}
class TransactionQueue {
    constructor() {
        this.queue = [];
        this.history = [];
    }
    addTransaction(command) {
        this.queue.push(command);
    }
    processQueue() {
        while (this.queue.length > 0) {
            const command = this.queue.shift();
            if (command) {
                command.execute();
                this.history.push(command);
            }
        }
    }
    undoLast() {
        const command = this.history.pop();
        if (command) {
            command.undo();
        }
    }
    redoLast() {
        if (this.history.length > 0) {
            const lastCommand = this.history[this.history.length - 1];
            const newCommand = Object.create(lastCommand);
            newCommand.execute();
            this.history.push(newCommand);
        }
    }
}
