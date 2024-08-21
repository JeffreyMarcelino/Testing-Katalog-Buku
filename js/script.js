document.addEventListener("DOMContentLoaded", function() {
    const booksPerPage = 10; // Jumlah buku per halaman
    const halfBooksPerPage = booksPerPage / 1;
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
                        CATEGORY: `${category.categoryName} ${subCategory.subCategoryName}`,
                        subCategoryName: subCategory.subCategoryName // Tambahkan subCategoryName
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

    document.getElementById('all-button').addEventListener('click', function() {
        document.getElementById('search-input').value = '';
        filteredBooks = allBooks; // Reset ke semua buku
        currentPage = 1; // Reset ke halaman pertama
        displayBooks(filteredBooks, currentPage);
        setupPagination(filteredBooks.length, booksPerPage);
    });

    document.getElementById('children-button').addEventListener('click', function() {
        filterByCategory("CHILDREN");
    });

    document.getElementById('fiction-button').addEventListener('click', function() {
        filterByCategory("FICTION");
    });

    document.getElementById('non-fiction-button').addEventListener('click', function() {
        filterByCategory("NON FICTION");
    });

    document.getElementById('korean-button').addEventListener('click', function() {
        filterByCategory("KOREAN BOOK");
    });

    document.getElementById('bca-button').addEventListener('click', function() {
        filterByCategory("JUDUL PILIHAN BCA");
    });

    // Tampilan Dropdown Mobile

    document.getElementById('mobile-search-button').addEventListener('click', function() {
        const searchTerm = document.getElementById('mobile-search-input').value.toLowerCase();
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
    // Dropdown functionality for mobile
    const mobileNavButton = document.getElementById('mobile-nav-button');
    const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');
    
    mobileNavButton.addEventListener('click', function() {
        mobileNavDropdown.style.display = mobileNavDropdown.style.display === 'block' ? 'none' : 'block';
    });

    // Handle dropdown category selection
    document.getElementById('mobile-all-button').addEventListener('click', function() {
        handleCategorySelection("ALL");
    });
    document.getElementById('mobile-children-button').addEventListener('click', function() {
        handleCategorySelection("CHILDREN");
    });
    document.getElementById('mobile-fiction-button').addEventListener('click', function() {
        handleCategorySelection("FICTION");
    });
    document.getElementById('mobile-non-fiction-button').addEventListener('click', function() {
        handleCategorySelection("NON FICTION");
    });
    document.getElementById('mobile-korean-button').addEventListener('click', function() {
        handleCategorySelection("KOREAN BOOK");
    });
    document.getElementById('mobile-bca-button').addEventListener('click', function() {
        handleCategorySelection("JUDUL PILIHAN BCA");
    });

    function handleCategorySelection(category) {
        if (category === "ALL") {
            document.getElementById('mobile-search-input').value = '';
            filteredBooks = allBooks; // Reset ke semua buku
        } else {
            filteredBooks = allBooks.filter(book => book.CATEGORY.startsWith(category));
        }
        currentPage = 1; // Reset ke halaman pertama
        displayBooks(filteredBooks, currentPage);
        setupPagination(filteredBooks.length, booksPerPage);
        mobileNavDropdown.style.display = 'none'; // Sembunyikan dropdown setelah memilih kategori
    }
    /// Tampilan Dropdown Mobile

    function filterByCategory(category) {
        filteredBooks = allBooks.filter(book => book.CATEGORY.startsWith(category));
        currentPage = 1; // Reset ke halaman pertama
        displayBooks(filteredBooks, currentPage);
        setupPagination(filteredBooks.length, booksPerPage);
    }
    
    function displayBooks(books, page) {
        const start = (page - 1) * booksPerPage;
        const end = start + booksPerPage;
        const paginatedBooks = books.slice(start, end);
        const bookCatalog = document.getElementById('book-catalog');
        
        // Display skeleton loaders before the books load
        bookCatalog.innerHTML = '';
        for (let i = 0; i < booksPerPage; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-loader';
            skeleton.innerHTML = `
                <div class="skeleton-img"></div>
                <div class="skeleton-text medium"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text short"></div>
            `;
            bookCatalog.appendChild(skeleton);
        }
        
        setTimeout(() => {
            // Clear skeleton loaders
            bookCatalog.innerHTML = '';
            
            // Display the books
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
        }, 1000); // Adjust time as needed
    }
    
    

    function createBookItem(book) {
        const bookItem = document.createElement('div');
        bookItem.className = 'card';
        bookItem.style.width = '18rem'; // Set width of the card
    
        // Create and append the book cover
        if (book.COVER_URL) {
            const bookCover = document.createElement('img');
            bookCover.src = book.COVER_URL;
            bookCover.className = 'card-img-top';
            bookCover.alt = book.TITLE;
            bookItem.appendChild(bookCover);
        }
    
        // Create and append the card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        bookItem.appendChild(cardBody);
    
        // Create and append the title wrapper and title
        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'card-title-wrapper';
    
        // Set the title text
        const bookTitle = document.createElement('h5');
        bookTitle.className = 'card-title';
        bookTitle.textContent = book.TITLE;
        titleWrapper.appendChild(bookTitle);
        cardBody.appendChild(titleWrapper);
    
        // The rest of your code remains unchanged...
        // Create and append the ISBN
        const bookIsbn = document.createElement('p');
        bookIsbn.className = 'card-text isbn'; // Add class for styling
        bookIsbn.textContent = `ISBN: ${book.ISBN}`;
        cardBody.appendChild(bookIsbn);
    
        // Create and append the BBW price if available
        if (book['Harga BBW']) {
            const bbwPriceWrapper = document.createElement('div');
            bbwPriceWrapper.className = `book-price ${getPriceClass(book.CATEGORY)}`;
    
            const bbwPriceLabel = document.createElement('span');
            bbwPriceLabel.className = 'price-label';
            // bbwPriceLabel.textContent = 'BBW:';
    
            const bbwPrice = document.createElement('span');
            bbwPrice.className = 'new-price';
            bbwPrice.textContent = `RP. ${book['Harga BBW']}`;
    
            bbwPriceWrapper.appendChild(bbwPriceLabel);
            bbwPriceWrapper.appendChild(bbwPrice);
            cardBody.appendChild(bbwPriceWrapper);
        }
    
        // Create and append the subCategoryName
        const subCategory = document.createElement('p');
        subCategory.className = 'card-text sub-category'; // Add class for styling
        subCategory.innerHTML = `<span class="sub-category-name">${book.subCategoryName}</span>`;
        cardBody.appendChild(subCategory);
    
        return bookItem;
    }
    
    
    

    function getPriceClass(category) {
        if (category.startsWith('CHILDREN')) {
            return 'new-price-children';
        } else if (category.startsWith('FICTION')) {
            return 'new-price-fiction';
        } else if (category.startsWith('NON FICTION')) {
            return 'new-price-non-fiction';
        } else if (category.startsWith('KOREAN BOOK')) {
            return 'new-price-korean';
        } else if (category.startsWith('JUDUL PILIHAN BCA')) {
            return 'new-price-bca';
        }
        return '';
    }
    


    function setupPagination(totalBooks, booksPerPage) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        const pageCount = Math.ceil(totalBooks / booksPerPage);
    
        const isMobile = window.innerWidth <= 576;
        const maxVisiblePages = isMobile ? 3 : 7; // Tampilkan maksimal 3 halaman pada mobile, 7 pada desktop
        const halfVisiblePages = Math.floor(maxVisiblePages / 2);
    
        let startPage = currentPage - halfVisiblePages;
        let endPage = currentPage + halfVisiblePages;
    
        if (startPage < 1) {
            startPage = 1;
            endPage = Math.min(maxVisiblePages, pageCount);
        } else if (endPage > pageCount) {
            endPage = pageCount;
            startPage = Math.max(1, pageCount - maxVisiblePages + 1);
        }
    
        for (let i = startPage; i <= endPage; i++) {
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
    
        // Add Previous and Next buttons only if not on mobile
        if (!isMobile) {
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
    }
    

    function filterBooks(books, searchTerm) {
        return books.filter(book => 
            book.TITLE.toLowerCase().includes(searchTerm) ||
            book.ISBN.toLowerCase().includes(searchTerm) ||
            book.CATEGORY.toLowerCase().includes(searchTerm)
        );
    }    
});
