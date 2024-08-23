document.addEventListener("DOMContentLoaded", function() {
    const App = {
        booksPerPage: 25,
        halfBooksPerPage: 5,
        currentPage: 1,
        allBooks: [],
        filteredBooks: [],

        init: function() {
            this.fetchBooks();
            this.setupEventListeners();
        },

        fetchBooks: function() {
            fetch('books.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    this.allBooks = this.processBookData(data);
                    this.filteredBooks = this.allBooks;
                    this.displayBooks(this.filteredBooks, this.currentPage);
                    this.setupPagination(this.filteredBooks.length, this.booksPerPage);
                })
                .catch(error => console.error('Error:', error));
        },

        processBookData: function(data) {
            return data.categories.reduce((accumulator, category) => {
                category.subCategories.forEach(subCategory => {
                    accumulator.push(...subCategory.books.map(book => ({
                        ...book,
                        CATEGORY: `${category.categoryName} ${subCategory.subCategoryName}`,
                        subCategoryName: subCategory.subCategoryName
                    })));
                });
                return accumulator;
            }, []);
        },

        setupEventListeners: function() {
            document.getElementById('search-button').addEventListener('click', () => this.handleSearch('search-input'));
            document.getElementById('all-button').addEventListener('click', () => this.handleAllBooks());
            document.getElementById('children-button').addEventListener('click', () => this.filterByCategory("CHILDREN"));
            document.getElementById('fiction-button').addEventListener('click', () => this.filterByCategory("FICTION"));
            document.getElementById('non-fiction-button').addEventListener('click', () => this.filterByCategory("NON FICTION"));
            document.getElementById('korean-button').addEventListener('click', () => this.filterByCategory("KOREAN BOOK"));
            document.getElementById('bca-button').addEventListener('click', () => this.filterByCategory("JUDUL PILIHAN BCA"));

            // Mobile-specific listeners
            document.getElementById('mobile-search-button').addEventListener('click', () => this.handleSearch('mobile-search-input'));
            document.getElementById('mobile-nav-button').addEventListener('click', this.toggleMobileNavDropdown);
            document.getElementById('mobile-all-button').addEventListener('click', () => this.handleCategorySelection("ALL"));
            document.getElementById('mobile-children-button').addEventListener('click', () => this.handleCategorySelection("CHILDREN"));
            document.getElementById('mobile-fiction-button').addEventListener('click', () => this.handleCategorySelection("FICTION"));
            document.getElementById('mobile-non-fiction-button').addEventListener('click', () => this.handleCategorySelection("NON FICTION"));
            document.getElementById('mobile-korean-button').addEventListener('click', () => this.handleCategorySelection("KOREAN BOOK"));
            document.getElementById('mobile-bca-button').addEventListener('click', () => this.handleCategorySelection("JUDUL PILIHAN BCA"));
        },

        handleSearch: function(inputId) {
            const searchTerm = document.getElementById(inputId).value.toLowerCase();
            const bookCatalog = document.getElementById('book-catalog');
            bookCatalog.innerHTML = '<div class="loading">Loading...</div>';
            setTimeout(() => {
                this.filteredBooks = this.filterBooks(this.allBooks, searchTerm);
                if (this.filteredBooks.length === 0) {
                    bookCatalog.innerHTML = '<div class="loading">No books found.</div>';
                } else {
                    this.currentPage = 1;
                    this.displayBooks(this.filteredBooks, this.currentPage);
                    this.setupPagination(this.filteredBooks.length, this.booksPerPage);
                }
            }, 1000);
        },

        handleAllBooks: function() {
            document.getElementById('search-input').value = '';
            this.filteredBooks = this.allBooks;
            this.currentPage = 1;
            this.displayBooks(this.filteredBooks, this.currentPage);
            this.setupPagination(this.filteredBooks.length, this.booksPerPage);
        },

        filterByCategory: function(category) {
            this.filteredBooks = this.allBooks.filter(book => book.CATEGORY.startsWith(category));
            this.currentPage = 1;
            this.displayBooks(this.filteredBooks, this.currentPage);
            this.setupPagination(this.filteredBooks.length, this.booksPerPage);
        },

        toggleMobileNavDropdown: function() {
            const mobileNavDropdown = document.getElementById('mobile-nav-dropdown');
            mobileNavDropdown.style.display = mobileNavDropdown.style.display === 'block' ? 'none' : 'block';
        },

        handleCategorySelection: function(category) {
            if (category === "ALL") {
                document.getElementById('mobile-search-input').value = '';
                this.filteredBooks = this.allBooks;
            } else {
                this.filteredBooks = this.allBooks.filter(book => book.CATEGORY.startsWith(category));
            }
            this.currentPage = 1;
            this.displayBooks(this.filteredBooks, this.currentPage);
            this.setupPagination(this.filteredBooks.length, this.booksPerPage);
            document.getElementById('mobile-nav-dropdown').style.display = 'none';
        },

        displayBooks: function(books, page) {
            const start = (page - 1) * this.booksPerPage;
            const end = start + this.booksPerPage;
            const paginatedBooks = books.slice(start, end);
            const bookCatalog = document.getElementById('book-catalog');
        
            bookCatalog.innerHTML = this.createSkeletonLoaders();
        
            setTimeout(() => {
                bookCatalog.innerHTML = '';
                
                // Menggunakan loop untuk menampilkan buku dalam grid 2x5
                paginatedBooks.forEach(book => {
                    bookCatalog.appendChild(this.createBookItem(book));
                });
            }, 1000);
        },

        createSkeletonLoaders: function() {
            let skeletonHTML = '';
            for (let i = 0; i < this.booksPerPage; i++) {
                skeletonHTML += `
                    <div class="skeleton-loader">
                        <div class="skeleton-img"></div>
                        <div class="skeleton-text medium"></div>
                        <div class="skeleton-text short"></div>
                        <div class="skeleton-text short"></div>
                        <div class="skeleton-text short"></div>
                    </div>
                `;
            }
            return skeletonHTML;
        },

        createBookItem: function(book) {
            const bookItem = document.createElement('div');
            bookItem.className = 'card';
            bookItem.style.width = '18rem';
        
            if (book.COVER_URL) {
                const bookCover = document.createElement('img');
                bookCover.src = book.COVER_URL;
                bookCover.className = 'card-img-top';
                bookCover.alt = book.TITLE;
                bookItem.appendChild(bookCover);
            }
        
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            bookItem.appendChild(cardBody);
        
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'card-title-wrapper';
        
            const bookTitle = document.createElement('h5');
            bookTitle.className = 'card-title';
            bookTitle.textContent = book.TITLE;
            titleWrapper.appendChild(bookTitle);
            cardBody.appendChild(titleWrapper);
        
            const bookIsbn = document.createElement('p');
            bookIsbn.className = 'card-text isbn';
            bookIsbn.textContent = `ISBN: ${book.ISBN}`;
            cardBody.appendChild(bookIsbn);
        
            if (book['Harga BBW']) {
                const bbwPriceWrapper = document.createElement('div');
                bbwPriceWrapper.className = `book-price ${this.getPriceClass(book.CATEGORY)}`;
        
                const bbwPriceLabel = document.createElement('span');
                bbwPriceLabel.className = 'price-label';
        
                const bbwPrice = document.createElement('span');
                bbwPrice.className = 'new-price';
                bbwPrice.textContent = `RP. ${book['Harga BBW']}`;
        
                bbwPriceWrapper.appendChild(bbwPriceLabel);
                bbwPriceWrapper.appendChild(bbwPrice);
                cardBody.appendChild(bbwPriceWrapper);
            }
        
            const subCategory = document.createElement('p');
            subCategory.className = 'card-text sub-category';
            subCategory.innerHTML = `<span class="sub-category-name">${book.subCategoryName}</span>`;
            cardBody.appendChild(subCategory);
        
            return bookItem;
        },

        getPriceClass: function(category) {
            const categories = {
                'CHILDREN': 'new-price-children',
                'FICTION': 'new-price-fiction',
                'NON FICTION': 'new-price-non-fiction',
                'KOREAN BOOK': 'new-price-korean',
                'JUDUL PILIHAN BCA': 'new-price-bca'
            };
            
            for (let key in categories) {
                if (category.startsWith(key)) {
                    return categories[key];
                }
            }
            return '';
        },

        setupPagination: function(totalBooks, booksPerPage) {
            const pagination = document.getElementById('pagination');
            pagination.innerHTML = '';
            const pageCount = Math.ceil(totalBooks / booksPerPage);
        
            const isMobile = window.innerWidth <= 576;
            const maxVisiblePages = isMobile ? 3 : 7;
            const halfVisiblePages = Math.floor(maxVisiblePages / 2);
        
            let startPage = this.currentPage - halfVisiblePages;
            let endPage = this.currentPage + halfVisiblePages;
        
            if (startPage < 1) {
                startPage = 1;
                endPage = Math.min(maxVisiblePages, pageCount);
            } else if (endPage > pageCount) {
                endPage = pageCount;
                startPage = Math.max(1, pageCount - maxVisiblePages + 1);
            }
        
            // Tambahkan informasi page di atas pagination
            const pageInfo = document.getElementById('page-info');
            if (pageInfo) {
                pageInfo.textContent = `Page ${this.currentPage} of ${pageCount} - ${totalBooks} results`;
            }
        
            for (let i = startPage; i <= endPage; i++) {
                pagination.appendChild(this.createPageItem(i, pageCount));
            }
        
            if (!isMobile) {
                pagination.insertBefore(this.createNavigationButton('Previous', () => this.changePage(this.currentPage - 1, pageCount)), pagination.firstChild);
                pagination.appendChild(this.createNavigationButton('Next', () => this.changePage(this.currentPage + 1, pageCount)));
            }
        },

        createPageItem: function(pageNumber, pageCount) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item' + (pageNumber === this.currentPage ? ' active' : '');
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = pageNumber;
            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePage(pageNumber, pageCount);
            });
            pageItem.appendChild(pageLink);
            return pageItem;
        },

        createNavigationButton: function(text, onClick) {
            const item = document.createElement('li');
            item.className = 'page-item';
            const link = document.createElement('a');
            link.className = 'page-link';
            link.href = '#';
            link.textContent = text;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                onClick();
            });
            item.appendChild(link);
            return item;
        },

        changePage: function(newPage, pageCount) {
            if (newPage >= 1 && newPage <= pageCount) {
                this.currentPage = newPage;
                this.displayBooks(this.filteredBooks, this.currentPage);
                this.setupPagination(this.filteredBooks.length, this.booksPerPage);
            }
        },

        filterBooks: function(books, searchTerm) {
            return books.filter(book => 
                book.TITLE.toLowerCase().includes(searchTerm) ||
                book.ISBN.toLowerCase().includes(searchTerm) ||
                book.CATEGORY.toLowerCase().includes(searchTerm)
            );
        }
    };

    App.init();
});