interface IBankAccount {
    readonly accountNumber: string;
    readonly balance: number;
    owner: Client;
    currency: string;
    getTransactionHistory(): Transaction[];
    executeTransaction(command: ICommand): void;
}

type TransactionType = "deposit" | "withdraw";

class Transaction {
    constructor(
        public type: TransactionType,
        public amount: number,
        public currency: string,
        public date: Date = new Date()
    ) {}
}

class Bank {
    private static instance: Bank;
    private accountManager: AccountManager;

    private constructor() {
        this.accountManager = new AccountManager();
    }

    public static getInstance(): Bank {
        if (!Bank.instance) {
            Bank.instance = new Bank();
        }
        return Bank.instance;
    }

    public getAccountManager(): AccountManager {
        return this.accountManager;
    }
}

class BankAccount implements IBankAccount {
    private _balance: number;
    private _owner: Client;
    private transactions: Transaction[] = [];
    public readonly accountNumber = this.generateAccountNumber();
    public readonly currency: string;

    public get balance(): number {
        return this._balance;
    }

    public get owner(): Client {
        return this._owner;
    }

    public set owner(value: Client) {
        this._owner = value;
    }

    constructor(owner: Client, balance: number, currency: string) {
        this._balance = balance;
        this._owner = owner;
        this.currency = currency;
    }

    public getTransactionHistory(): Transaction[] {
        return this.transactions;
    }

    public executeTransaction(command: ICommand): void {
        command.execute();
    }

    private deposit(amount: number): void {
        if (amount <= 0) {
            console.error("Deposit amount must be positive");
            return;
        }
        this._balance += amount;
        this.transactions.push(new Transaction("deposit", amount, this.currency));
    }

    private withdraw(amount: number): void {
        if (amount > this._balance) {
            console.error("Insufficient funds");
            return;
        }
        this._balance -= amount;
        this.transactions.push(new Transaction("withdraw", amount, this.currency));
    }

    private generateAccountNumber(): string {
        return `ACC-${Math.floor(Math.random() * 10000)}`;
    }
}

class AccountManager {
    private accounts = new Map<string, IBankAccount>();

    public createAccount(owner: Client, balance: number, currency: string): IBankAccount {
        const account = new BankAccount(owner, balance, currency);
        this.accounts.set(account.accountNumber, account);
        return account;
    }

    public closeAccount(accountNumber: string): void {
        this.accounts.delete(accountNumber);
    }

    public getAccount(accountNumber: string): IBankAccount | undefined {
        return this.accounts.get(accountNumber);
    }
}

class Client {
    private readonly firstName: string;
    private readonly lastName: string;
    private readonly accounts = new Map<string, IBankAccount>();

    public get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    constructor(firstName: string, lastName: string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public createAccount(balance: number, currency: string): IBankAccount {
        const account = Bank.getInstance().getAccountManager().createAccount(this, balance, currency);
        this.accounts.set(account.accountNumber, account);
        return account;
    }

    public getAccounts(): IBankAccount[] {
        return Array.from(this.accounts.values());
    }
}

interface ICommand {
    execute(): void;
    undo(): void;
}

class DepositCommand implements ICommand {
    constructor(private account: BankAccount, private amount: number) {}

    execute(): void {
        this.account["deposit"](this.amount);
    }

    undo(): void {
        this.account["withdraw"](this.amount);
    }
}

class WithdrawCommand implements ICommand {
    constructor(private account: BankAccount, private amount: number) {}

    execute(): void {
        this.account["withdraw"](this.amount);
    }

    undo(): void {
        this.account["deposit"](this.amount);
    }
}

class TransactionQueue {
    private queue: ICommand[] = [];
    private history: ICommand[] = [];

    public addTransaction(command: ICommand): void {
        this.queue.push(command);
    }

    public processQueue(): void {
        while (this.queue.length > 0) {
            const command = this.queue.shift();
            if (command) {
                command.execute();
                this.history.push(command);
            }
        }
    }

    public undoLast(): void {
        const command = this.history.pop();
        if (command) {
            command.undo();
        }
    }

    public redoLast(): void {
        if (this.history.length > 0) {
            const lastCommand = this.history[this.history.length - 1];
            const newCommand = Object.create(lastCommand);
            newCommand.execute();
            this.history.push(newCommand);
        }
    }
}
