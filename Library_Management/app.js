function generateId(prefix) {
  if (prefix === undefined) {
    prefix = "id";
  }
  return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
}

function formatDate(isoString) {
  if (!isoString) {
    return "N/A";
  }
  const dateObject = new Date(isoString);
  return dateObject.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysBetween(date1, date2) {
  const oneDay = 1000 * 60 * 60 * 24;
  let diff = new Date(date2).getTime() - new Date(date1).getTime();
  if (diff < 0) {
    diff = diff * -1;
  }
  return Math.floor(diff / oneDay);
}

function debounce(fn, delay) {
  if (delay === undefined) {
    delay = 300;
  }
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(function () {
      fn.apply(this, args);
    }, delay);
  };
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

class Book {
  constructor(title, author, genre, totalCopies) {
    this.id = generateId("b");
    this.title = title;
    this.author = author;
    this.genre = genre;
    this.totalCopies = totalCopies;
    this.availableCopies = totalCopies;
    this.addedDate = new Date().toISOString();
  }

  get isAvailable() {
    return this.availableCopies > 0;
  }

  static fromJSON(obj) {
    const book = Object.create(Book.prototype);
    Object.assign(book, obj);
    return book;
  }
}

class Member {
  constructor(name) {
    this.id = generateId("m");
    this.name = name;
    this.joinDate = new Date().toISOString();
    this.borrowedBookIds = [];
    this.finesOwed = 0;
  }

  static fromJSON(obj) {
    const member = Object.create(Member.prototype);
    Object.assign(member, obj);
    return member;
  }
}

class Transaction {
  constructor(bookId, memberId, dueDays) {
    if (dueDays === undefined) {
      dueDays = 14;
    }
    this.id = generateId("t");
    this.bookId = bookId;
    this.memberId = memberId;
    this.issueDate = new Date().toISOString();

    const dueDateObject = new Date();
    dueDateObject.setDate(dueDateObject.getDate() + dueDays);
    this.dueDate = dueDateObject.toISOString();

    this.returnDate = null;
    this.status = "issued";
    this.fine = 0;
  }

  get isOverdue() {
    if (this.status === "returned") {
      return false;
    }
    return new Date() > new Date(this.dueDate);
  }

  static fromJSON(obj) {
    const transaction = Object.create(Transaction.prototype);
    Object.assign(transaction, obj);
    return transaction;
  }
}

const STORAGE_KEYS = {
  BOOKS: "library_books",
  MEMBERS: "library_members",
  TRANSACTIONS: "library_transactions",
};

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Save failed for " + key, error);
    return false;
  }
}

function loadFromStorage(key, fallbackValue) {
  try {
    const rawText = localStorage.getItem(key);
    if (rawText === null) {
      return fallbackValue;
    }
    return JSON.parse(rawText);
  } catch (error) {
    console.error("Load failed for " + key, error);
    return fallbackValue;
  }
}

function getBooksFromStorage() {
  return loadFromStorage(STORAGE_KEYS.BOOKS, []);
}
function saveBooksToStorage(arr) {
  return saveToStorage(STORAGE_KEYS.BOOKS, arr);
}
function getMembersFromStorage() {
  return loadFromStorage(STORAGE_KEYS.MEMBERS, []);
}
function saveMembersToStorage(arr) {
  return saveToStorage(STORAGE_KEYS.MEMBERS, arr);
}
function getTransactionsFromStorage() {
  return loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
}
function saveTransactionsToStorage(arr) {
  return saveToStorage(STORAGE_KEYS.TRANSACTIONS, arr);
}

class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  emit(eventName, payload) {
    if (!this.listeners[eventName]) {
      return;
    }
    for (let i = 0; i < this.listeners[eventName].length; i++) {
      this.listeners[eventName][i](payload);
    }
  }
}

const eventBus = new EventBus();

const FINE_PER_DAY = 5;

class Library {
  constructor() {
    this.books = [];
    this.members = [];
    this.transactions = [];

    const rawBooks = getBooksFromStorage();
    for (let i = 0; i < rawBooks.length; i++) {
      this.books.push(Book.fromJSON(rawBooks[i]));
    }

    const rawMembers = getMembersFromStorage();
    for (let i = 0; i < rawMembers.length; i++) {
      this.members.push(Member.fromJSON(rawMembers[i]));
    }

    const rawTransactions = getTransactionsFromStorage();
    for (let i = 0; i < rawTransactions.length; i++) {
      this.transactions.push(Transaction.fromJSON(rawTransactions[i]));
    }
  }

  persistData() {
    saveBooksToStorage(this.books);
    saveMembersToStorage(this.members);
    saveTransactionsToStorage(this.transactions);
  }

  addBook(bookData) {
    if (!isNonEmptyString(bookData.title)) {
      throw new ValidationError("Title is required", "title");
    }
    if (!isNonEmptyString(bookData.author)) {
      throw new ValidationError("Author is required", "author");
    }
    if (!isPositiveInteger(bookData.totalCopies)) {
      throw new ValidationError("Copies must be a positive number", "totalCopies");
    }

    const newBook = new Book(bookData.title, bookData.author, bookData.genre, bookData.totalCopies);
    this.books.push(newBook);
    this.persistData();
    eventBus.emit("data:changed", null);
    return newBook;
  }

  deleteBook(bookId) {
    let isIssued = false;
    for (let i = 0; i < this.transactions.length; i++) {
      if (this.transactions[i].bookId === bookId && this.transactions[i].status === "issued") {
        isIssued = true;
      }
    }
    if (isIssued) {
      throw new Error("Cannot delete a book that has copies currently issued");
    }

    const remaining = [];
    for (let i = 0; i < this.books.length; i++) {
      if (this.books[i].id !== bookId) {
        remaining.push(this.books[i]);
      }
    }
    this.books = remaining;
    this.persistData();
    eventBus.emit("data:changed", null);
  }

  getBook(bookId) {
    for (let i = 0; i < this.books.length; i++) {
      if (this.books[i].id === bookId) {
        return this.books[i];
      }
    }
    return undefined;
  }

  getBooks() {
    return this.books.slice();
  }

  addMember(name) {
    if (!isNonEmptyString(name)) {
      throw new ValidationError("Member name is required", "name");
    }
    const newMember = new Member(name);
    this.members.push(newMember);
    this.persistData();
    eventBus.emit("data:changed", null);
    return newMember;
  }

  deleteMember(memberId) {
    const member = this.getMember(memberId);
    if (!member) {
      throw new Error("Member not found");
    }
    if (member.borrowedBookIds.length > 0) {
      throw new Error("Cannot delete a member who still has borrowed books");
    }

    const remaining = [];
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i].id !== memberId) {
        remaining.push(this.members[i]);
      }
    }
    this.members = remaining;
    this.persistData();
    eventBus.emit("data:changed", null);
  }

  getMember(memberId) {
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i].id === memberId) {
        return this.members[i];
      }
    }
    return undefined;
  }

  getMembers() {
    return this.members.slice();
  }

  issueBook(bookId, memberId) {
    const book = this.getBook(bookId);
    const member = this.getMember(memberId);

    if (!book) {
      throw new Error("Book not found");
    }
    if (!member) {
      throw new Error("Member not found");
    }
    if (!book.isAvailable) {
      throw new Error("No copies available");
    }

    book.availableCopies = book.availableCopies - 1;
    const newTransaction = new Transaction(bookId, memberId);
    this.transactions.push(newTransaction);
    member.borrowedBookIds.push(bookId);

    this.persistData();
    eventBus.emit("data:changed", null);
    return newTransaction;
  }

  getActiveTransactions() {
    const active = [];
    for (let i = 0; i < this.transactions.length; i++) {
      if (this.transactions[i].status === "issued") {
        active.push(this.transactions[i]);
      }
    }
    return active;
  }

  getTransaction(transactionId) {
    for (let i = 0; i < this.transactions.length; i++) {
      if (this.transactions[i].id === transactionId) {
        return this.transactions[i];
      }
    }
    return undefined;
  }

  returnBook(transactionId) {
    const foundTransaction = this.getTransaction(transactionId);

    if (!foundTransaction) {
      throw new Error("Loan record not found");
    }
    if (foundTransaction.status === "returned") {
      throw new Error("This copy has already been returned");
    }

    const wasOverdue = foundTransaction.isOverdue;
    foundTransaction.returnDate = new Date().toISOString();
    foundTransaction.status = "returned";

    const member = this.getMember(foundTransaction.memberId);
    const book = this.getBook(foundTransaction.bookId);

    if (wasOverdue) {
      const lateDays = daysBetween(foundTransaction.dueDate, foundTransaction.returnDate);
      foundTransaction.fine = lateDays * FINE_PER_DAY;
      if (member) {
        member.finesOwed = member.finesOwed + foundTransaction.fine;
      }
    }

    if (book) {
      book.availableCopies = book.availableCopies + 1;
    }

    if (member) {
      const remainingIds = [];
      let alreadyRemovedOne = false;
      for (let i = 0; i < member.borrowedBookIds.length; i++) {
        if (member.borrowedBookIds[i] === foundTransaction.bookId && !alreadyRemovedOne) {
          alreadyRemovedOne = true;
        } else {
          remainingIds.push(member.borrowedBookIds[i]);
        }
      }
      member.borrowedBookIds = remainingIds;
    }

    this.persistData();
    eventBus.emit("data:changed", null);
    return foundTransaction;
  }

  searchBooks(query) {
    const lowerQuery = query.toLowerCase();
    const matches = [];
    for (let i = 0; i < this.books.length; i++) {
      const book = this.books[i];
      if (book.title.toLowerCase().includes(lowerQuery) || book.author.toLowerCase().includes(lowerQuery)) {
        matches.push(book);
      }
    }
    return matches;
  }

  sortBooks(booksArray, field, direction) {
    if (direction === undefined) {
      direction = "asc";
    }
    const copied = booksArray.slice();
    copied.sort(function (bookA, bookB) {
      if (bookA[field] < bookB[field]) {
        return direction === "asc" ? -1 : 1;
      }
      if (bookA[field] > bookB[field]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return copied;
  }

  getStats() {
    const totalBooks = this.books.length;

    let totalIssued = 0;
    let totalOverdue = 0;
    for (let i = 0; i < this.transactions.length; i++) {
      if (this.transactions[i].status === "issued") {
        totalIssued = totalIssued + 1;
      }
      if (this.transactions[i].isOverdue) {
        totalOverdue = totalOverdue + 1;
      }
    }

    let totalFines = 0;
    for (let i = 0; i < this.members.length; i++) {
      totalFines = totalFines + this.members[i].finesOwed;
    }

    const genreCount = {};
    for (let i = 0; i < this.books.length; i++) {
      const genre = this.books[i].genre;
      if (genreCount[genre]) {
        genreCount[genre] = genreCount[genre] + 1;
      } else {
        genreCount[genre] = 1;
      }
    }

    let mostPopularGenre = null;
    let highestCount = 0;
    const genreNames = Object.keys(genreCount);
    for (let i = 0; i < genreNames.length; i++) {
      if (genreCount[genreNames[i]] > highestCount) {
        highestCount = genreCount[genreNames[i]];
        mostPopularGenre = genreNames[i];
      }
    }

    return {
      totalBooks: totalBooks,
      totalIssued: totalIssued,
      totalOverdue: totalOverdue,
      totalFines: totalFines,
      mostPopularGenre: mostPopularGenre,
    };
  }
}