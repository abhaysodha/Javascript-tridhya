import { generateId } from "./utils"
export class Book {
    constructor(title,author,genre,totalCopies){
        this.id = generateId('b');
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.totalCopies = totalCopies;
        this.availableCopies = totalCopies;
        this.addedDate = new Date().toISOString();
    }

    get isAvailable(){
        return this.availableCopies > 0;
    }

    static fromJSON(obj){
        const book = Object.create(Book.prototype);
        return Object.assign(book,obj);
    }
}

export class Member {
    constructor (name,email){
        this.id = generateId('m');
        this.name = name;
        this.email = email;
        this.joinDate = new Date().toISOString();
        this.borrowedBookIds = [];
        this.finesOwed = 0;    
    }

    get hasOverdueFines(){
        return this.finesOwned > 0;
    }
    static fromJSON(obj){
        const member =  Object.create(Member.prototype);
        return Object.assign(member,obj);
    }
}

export class Transaction{
    constructor(bookId,memberId,dueDays = 14){
        this.id = generateId('t');
        this.bookId = bookId;
        this.memberId = memberId;
        this.issueDate = new Date().toISOString();

        const due = new Date();
        due.setDate(due.getDate() + dueDays);
        this.dueDate = due.toISOString();

        this.returnDate = null;
        this.status = "issued";
        this.fine = 0;
    }

    get isOverdue(){
        if(this.status === "returned") return false;
        return new Date() > new Date(this.dueDate);
    }
    
    static fromJSON(obj){
        const txn = Object.create(Transaction.prototype);
        return Object.assign(txn,obj);
    }
}

