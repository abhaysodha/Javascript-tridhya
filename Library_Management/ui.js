let library;
let currentSearchText = "";
let currentSortField = "title";
let currentSortDirection = "asc";

function getFilteredAndSortedBooks() {
  let result;
  if (currentSearchText) {
    result = library.searchBooks(currentSearchText);
  } else {
    result = library.getBooks();
  }
  result = library.sortBooks(result, currentSortField, currentSortDirection);
  return result;
}

function renderBookRow(book) {
  let issueButtonHtml;
  if (book.isAvailable) {
    issueButtonHtml = "<button class='btn-small btn-issue' data-action='issue' data-id='" + book.id + "'>Issue</button>";
  } else {
    issueButtonHtml = "<button class='btn-small btn-issue' disabled>No Copies Left</button>";
  }

  let statusBadge;
  if (book.isAvailable) {
    statusBadge = "<span class='badge badge-available'>Available</span>";
  } else {
    statusBadge = "<span class='badge badge-issued'>Fully Issued</span>";
  }

  return (
    "<tr>" +
    "<td><strong>" + book.title + "</strong></td>" +
    "<td>" + book.author + "</td>" +
    "<td>" + book.genre + "</td>" +
    "<td>" + book.availableCopies + " / " + book.totalCopies + "</td>" +
    "<td>" + statusBadge + "</td>" +
    "<td class='actions-cell'>" + issueButtonHtml +
    "<button class='btn-small btn-delete' data-action='delete' data-id='" + book.id + "'>Delete</button></td>" +
    "</tr>"
  );
}

function renderBookList() {
  const container = document.getElementById("book-list-body");
  const booksToShow = getFilteredAndSortedBooks();

  if (booksToShow.length === 0) {
    container.innerHTML = "<tr><td colspan='6' class='empty-message'>No books found</td></tr>";
    return;
  }

  let html = "";
  for (let i = 0; i < booksToShow.length; i++) {
    html = html + renderBookRow(booksToShow[i]);
  }
  container.innerHTML = html;
}

function renderLoanRow(transaction) {
  const book = library.getBook(transaction.bookId);
  const member = library.getMember(transaction.memberId);

  let bookTitle = "Unknown Book";
  if (book) {
    bookTitle = book.title;
  }

  let memberName = "Unknown Member";
  if (member) {
    memberName = member.name;
  }

  let statusBadge;
  if (transaction.isOverdue) {
    statusBadge = "<span class='badge badge-issued'>Overdue</span>";
  } else {
    statusBadge = "<span class='badge badge-available'>On Time</span>";
  }

  return (
    "<tr>" +
    "<td><strong>" + bookTitle + "</strong></td>" +
    "<td>" + memberName + "</td>" +
    "<td>" + formatDate(transaction.dueDate) + "</td>" +
    "<td>" + statusBadge + "</td>" +
    "<td class='actions-cell'>" +
    "<button class='btn-small btn-return' data-action='return' data-id='" + transaction.id + "'>Return</button>" +
    "</td>" +
    "</tr>"
  );
}

function renderLoanList() {
  const container = document.getElementById("loans-list-body");
  const activeLoans = library.getActiveTransactions();

  if (activeLoans.length === 0) {
    container.innerHTML = "<tr><td colspan='5' class='empty-message'>No Books issued Till Now</td></tr>";
    return;
  }

  let html = "";
  for (let i = 0; i < activeLoans.length; i++) {
    html = html + renderLoanRow(activeLoans[i]);
  }
  container.innerHTML = html;
}

function renderMemberRow(member) {
  return (
    "<tr>" +
    "<td><strong>" + member.name + "</strong></td>" +
    "<td>" + formatDate(member.joinDate) + "</td>" +
    "<td>" + member.borrowedBookIds.length + "</td>" +
    "<td>Rs " + member.finesOwed + "</td>" +
    "<td class='actions-cell'><button class='btn-small btn-delete' data-action='delete-member' data-id='" + member.id + "'>Delete</button></td>" +
    "</tr>"
  );
}

function renderMemberList() {
  const container = document.getElementById("member-list-body");
  const members = library.getMembers();

  if (members.length === 0) {
    container.innerHTML = "<tr><td colspan='5' class='empty-message'>No members yet</td></tr>";
    return;
  }

  let html = "";
  for (let i = 0; i < members.length; i++) {
    html = html + renderMemberRow(members[i]);
  }
  container.innerHTML = html;
}

function renderDashboard() {
  const stats = library.getStats();
  const container = document.getElementById("dashboard");

  let topGenreText = stats.mostPopularGenre;
  if (!topGenreText) {
    topGenreText = "N/A";
  }

  container.innerHTML =
    "<div class='stat-card'><span class='stat-number'>" + stats.totalBooks + "</span><span class='stat-label'>Total Books</span></div>" +
    "<div class='stat-card'><span class='stat-number'>" + stats.totalIssued + "</span><span class='stat-label'>Issued</span></div>" +
    "<div class='stat-card stat-danger'><span class='stat-number'>" + stats.totalOverdue + "</span><span class='stat-label'>Overdue</span></div>" +
    "<div class='stat-card stat-warning'><span class='stat-number'>Rs " + stats.totalFines + "</span><span class='stat-label'>Fines</span></div>" +
    "<div class='stat-card'><span class='stat-number'>" + topGenreText + "</span><span class='stat-label'>Top Genre</span></div>";
}

function populateMemberSelect() {
  const select = document.getElementById("issue-member-select");
  const members = library.getMembers();

  if (members.length === 0) {
    select.innerHTML = "<option value=''>Add a member first</option>";
    return;
  }

  let html = "<option value=''>Select member</option>";
  for (let i = 0; i < members.length; i++) {
    html = html + "<option value='" + members[i].id + "'>" + members[i].name + "</option>";
  }
  select.innerHTML = html;
}

function renderEverything() {
  renderBookList();
  renderLoanList();
  renderMemberList();
  renderDashboard();
  populateMemberSelect();
}

function showToast(message, isError) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = isError ? "toast toast-error" : "toast toast-success";
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(function () {
    toast.remove();
  }, 2500);
}

function showFieldError(inputElement, message) {
  clearFieldErrors(inputElement.closest("form"));
  const errorElement = document.createElement("div");
  errorElement.className = "field-error";
  errorElement.textContent = message;
  inputElement.insertAdjacentElement("afterend", errorElement);
  inputElement.classList.add("input-error");
}

function clearFieldErrors(form) {
  const errors = form.querySelectorAll(".field-error");
  for (let i = 0; i < errors.length; i++) {
    errors[i].remove();
  }
  const badInputs = form.querySelectorAll(".input-error");
  for (let i = 0; i < badInputs.length; i++) {
    badInputs[i].classList.remove("input-error");
  }
}

function setupAddBookForm() {
  const form = document.getElementById("add-book-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      library.addBook({
        title: formData.get("title"),
        author: formData.get("author"),
        genre: formData.get("genre"),
        totalCopies: Number(formData.get("totalCopies")),
      });
      form.reset();
      clearFieldErrors(form);
      showToast("Book added successfully", false);
    } catch (error) {
      if (error instanceof ValidationError) {
        const input = form.querySelector("[name='" + error.field + "']");
        showFieldError(input, error.message);
      } else {
        showToast(error.message, true);
      }
    }
  });
}

function setupAddMemberForm() {
  const form = document.getElementById("add-member-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      library.addMember(formData.get("name"));
      form.reset();
      clearFieldErrors(form);
      showToast("Member added successfully", false);
    } catch (error) {
      if (error instanceof ValidationError) {
        const input = form.querySelector("[name='" + error.field + "']");
        showFieldError(input, error.message);
      } else {
        showToast(error.message, true);
      }
    }
  });
}

function setupBookListClicks() {
  const container = document.getElementById("book-list-body");
  container.addEventListener("click", function (event) {
    const clickedButton = event.target.closest("[data-action]");
    if (!clickedButton) {
      return;
    }

    const action = clickedButton.dataset.action;
    const bookId = clickedButton.dataset.id;

    if (action === "issue") {
      const memberId = document.getElementById("issue-member-select").value;
      if (!memberId) {
        showToast("Please select a member first", true);
        return;
      }
      try {
        library.issueBook(bookId, memberId);
        showToast("Book issued successfully", false);
      } catch (error) {
        showToast(error.message, true);
      }
    }

    if (action === "delete") {
      try {
        library.deleteBook(bookId);
        showToast("Book deleted", false);
      } catch (error) {
        showToast(error.message, true);
      }
    }
  });
}

function setupLoanListClicks() {
  const container = document.getElementById("loans-list-body");
  container.addEventListener("click", function (event) {
    const clickedButton = event.target.closest("[data-action]");
    if (!clickedButton) {
      return;
    }

    if (clickedButton.dataset.action === "return") {
      const transactionId = clickedButton.dataset.id;
      try {
        const returned = library.returnBook(transactionId);
        if (returned.fine > 0) {
          showToast("Returned late. Fine charged: Rs " + returned.fine, true);
        } else {
          showToast("Returned on time", false);
        }
      } catch (error) {
        showToast(error.message, true);
      }
    }
  });
}

function setupMemberListClicks() {
  const container = document.getElementById("member-list-body");
  container.addEventListener("click", function (event) {
    const clickedButton = event.target.closest("[data-action]");
    if (!clickedButton) {
      return;
    }
    if (clickedButton.dataset.action === "delete-member") {
      try {
        library.deleteMember(clickedButton.dataset.id);
        showToast("Member deleted", false);
      } catch (error) {
        showToast(error.message, true);
      }
    }
  });
}

function setupSearchInput() {
  const input = document.getElementById("search-input");
  const debouncedSearch = debounce(function (value) {
    currentSearchText = value;
    renderBookList();
  }, 300);

  input.addEventListener("input", function (event) {
    debouncedSearch(event.target.value);
  });
}

function setupSortControl() {
  const select = document.getElementById("sort-control");
  select.addEventListener("change", function (event) {
    const parts = event.target.value.split(":");
    currentSortField = parts[0];
    currentSortDirection = parts[1];
    renderBookList();
  });
}

function initApp() {
  library = new Library();

  eventBus.on("data:changed", renderEverything);

  setupAddBookForm();
  setupAddMemberForm();
  setupBookListClicks();
  setupLoanListClicks();
  setupMemberListClicks();
  setupSearchInput();
  setupSortControl();

  renderEverything();
}

window.addEventListener("DOMContentLoaded", initApp);