document.addEventListener("DOMContentLoaded", function() {
    const booksPerPage = 10; // Jumlah buku per halaman
    const halfBooksPerPage = booksPerPage / 2;
    let currentPage = 1;
    let allBooks = [];
    let filteredBooks = [];

    fetch('books.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            allBooks = data.categories.reduce((accumulator, category) => {
                category.subCategories.forEach(subCategory => {
                    accumulator.push(...subCategory.books.map(book => ({
                        ...book,
                        CATEGORY: `${category.categoryName} ${subCategory.subCategoryName}`
                    })));
                });
                return accumulator;
            }, []);
            filteredBooks = allBooks; // Default to all books
            displayBooks(filteredBooks, currentPage);
            setupPagination(filteredBooks.length, booksPerPage);
        })
        .catch(error => console.error('Error:', error));

    document.getElementById('search-button').addEventListener('click', function() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const bookCatalog = document.getElementById('book-catalog');
        bookCatalog.innerHTML = '<div class="loading">Loading...</div>';
        setTimeout(() => {
            filteredBooks = filterBooks(allBooks, searchTerm);
            if (filteredBooks.length === 0) {
                bookCatalog.innerHTML = '<div class="loading">No books found.</div>';
            } else {
                currentPage = 1; // Reset ke halaman pertama saat pencarian
                displayBooks(filteredBooks, currentPage);
                setupPagination(filteredBooks.length, booksPerPage);
            }
        }, 1000);
    });

    document.getElementById('home-button').addEventListener('click', function() {
        document.getElementById('search-input').value = '';
        filteredBooks = allBooks; // Reset ke semua buku
        currentPage = 1; // Reset ke halaman pertama
        displayBooks(filteredBooks, currentPage);
        setupPagination(filteredBooks.length, booksPerPage);
    });

    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filteredBooks = filterBooksByCategory(allBooks, category);
            currentPage = 1; // Reset ke halaman pertama saat memilih kategori
            displayBooks(filteredBooks, currentPage);
            setupPagination(filteredBooks.length, booksPerPage);
        });
    });
    
    function displayBooks(books, page) {
        const start = (page - 1) * booksPerPage;
        const end = start + booksPerPage;
        const paginatedBooks = books.slice(start, end);
        const bookCatalog = document.getElementById('book-catalog');
        bookCatalog.innerHTML = '';

        // Display first half of the books
        paginatedBooks.slice(0, halfBooksPerPage).forEach(book => {
            const bookItem = createBookItem(book);
            bookCatalog.appendChild(bookItem);
        });

        // Add a spacer
        const spacer = document.createElement('div');
        spacer.style.flexBasis = '100%';
        bookCatalog.appendChild(spacer);

        // Display second half of the books
        paginatedBooks.slice(halfBooksPerPage).forEach(book => {
            const bookItem = createBookItem(book);
            bookCatalog.appendChild(bookItem);
        });
    }

    function createBookItem(book) {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';

        if (book.COVER_URL) {
            const bookCover = document.createElement('img');
            bookCover.src = book.COVER_URL;
            bookCover.alt = book.TITLE;
            bookCover.onload = function() {
                if (bookCover.width > 177 && bookCover.height < 100) {
                    const marginTop = 100;
                    bookCover.style.marginTop = `${marginTop}px`;
                } else if (bookCover.width > 177 && bookCover.height < 124) {
                    const marginTop = 60;
                    bookCover.style.marginTop = `${marginTop}px`;
                } else if (bookCover.width > 199 && bookCover.height < 250) {
                    const marginTop = 50;
                    bookCover.style.marginTop = `${marginTop}px`;
                }
            };
            bookItem.appendChild(bookCover);
        }

        const bookTitle = document.createElement('h2');
        bookTitle.textContent = book.TITLE;
        bookItem.appendChild(bookTitle);

        const bookIsbn = document.createElement('p');
        bookIsbn.textContent = `ISBN: ${book.ISBN}`;
        bookItem.appendChild(bookIsbn);

        const priceInfo = document.createElement('p');
        if (book.DISCOUNT_PRICE) {
            priceInfo.innerHTML = `Price: <span class="discount-price">Rp. ${book.PRICE}</span> <span class="new-price">Disc Price: Rp. ${book.DISCOUNT_PRICE}</span>`;
        } else {
            priceInfo.textContent = `Price: Rp. ${book.PRICE}`;
        }
        bookItem.appendChild(priceInfo);

        const bookCategory = document.createElement('p');
        const categoryNameOnly = book.CATEGORY.split(' ')[0]; // Mengambil hanya categoryName
        bookCategory.textContent = `Category: ${categoryNameOnly}`;
        bookItem.appendChild(bookCategory);

        return bookItem;
    }

    function setupPagination(totalBooks, booksPerPage) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        const pageCount = Math.ceil(totalBooks / booksPerPage);

        for (let i = 1; i <= pageCount; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item' + (i === currentPage ? ' active' : '');
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = i;
                displayBooks(filteredBooks, currentPage);
                setupPagination(totalBooks, booksPerPage);
            });
            pageItem.appendChild(pageLink);
            pagination.appendChild(pageItem);
        }

        const prevItem = document.createElement('li');
        prevItem.className = 'page-item';
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.textContent = 'Previous';
        prevLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                displayBooks(filteredBooks, currentPage);
                setupPagination(totalBooks, booksPerPage);
            }
        });
        prevItem.appendChild(prevLink);
        pagination.insertBefore(prevItem, pagination.firstChild);

        const nextItem = document.createElement('li');
        nextItem.className = 'page-item';
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.textContent = 'Next';
        nextLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (currentPage < pageCount) {
                currentPage++;
                displayBooks(filteredBooks, currentPage);
                setupPagination(totalBooks, booksPerPage);
            }
        });
        nextItem.appendChild(nextLink);
        pagination.appendChild(nextItem);
    }

    function filterBooks(books, searchTerm) {
        return books.filter(book =>
            book.TITLE.toLowerCase().includes(searchTerm) ||
            book.CATEGORY.toLowerCase().includes(searchTerm) ||
            book.ISBN.includes(searchTerm)
        );
    }

    function filterBooksByCategory(books, category) {
        return books.filter(book =>
            book.CATEGORY.startsWith(category)
        );
    }
});
