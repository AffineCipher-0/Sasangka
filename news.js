document.addEventListener('DOMContentLoaded', () => {
    // Pastikan kode ini hanya berjalan jika elemen yang dibutuhkan ada di halaman
    const newsContainer = document.getElementById('tech-news-container');
    if (!newsContainer) {
        return; // Keluar jika bukan halaman berita
    }

    const newsCategories = {
        all: 'technology OR AI OR IoT OR programming OR cybersecurity',
        ai: '"artificial intelligence" OR "generative AI" OR "machine learning"',
        networking: '"computer network" OR "network infrastructure" OR 5G OR 6G',
        iot: '"internet of things" OR "smart city" OR "smart home"',
        cybersecurity: 'cybersecurity OR "data breach" OR malware OR vulnerability',
        programming: 'programming OR "software development" OR python OR javascript',
    };
    
    async function fetchAndRenderTechNews(category = 'all') {
        const loadingIndicator = document.getElementById('tech-news-loading');
        
        loadingIndicator.style.display = 'block';
        newsContainer.innerHTML = '';
    
        const query = newsCategories[category] || newsCategories.all;
        
        // Definisikan dua sumber: Global (en-US) dan Indonesia (id-ID)
        const rssUrlGlobal = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const rssUrlIndonesia = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;
    
        const apiUrlGlobal = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrlGlobal)}`;
        const apiUrlIndonesia = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrlIndonesia)}`;
    
        try {
            // Ambil berita dari kedua sumber secara paralel
            const [responseGlobal, responseIndonesia] = await Promise.all([
                fetch(apiUrlGlobal),
                fetch(apiUrlIndonesia)
            ]);
    
            if (!responseGlobal.ok || !responseIndonesia.ok) {
                throw new Error(`HTTP error! Status: Global ${responseGlobal.status}, Indonesia ${responseIndonesia.status}`);
            }
    
            const resultGlobal = await responseGlobal.json();
            const resultIndonesia = await responseIndonesia.json();
    
            let combinedItems = [];
            if (resultGlobal.status === 'ok') {
                // Tandai setiap item berita dengan asalnya
                const globalItems = resultGlobal.items.map(item => ({ ...item, origin: 'global' }));
                combinedItems.push(...globalItems);
            }
            if (resultIndonesia.status === 'ok') {
                // Tandai setiap item berita dengan asalnya
                const indonesianItems = resultIndonesia.items.map(item => ({ ...item, origin: 'indonesia' }));
                combinedItems.push(...indonesianItems);
            }
    
            if (combinedItems.length === 0) throw new Error("Tidak ada berita yang ditemukan dari kedua sumber.");

            // Hapus duplikat berdasarkan judul berita
            const uniqueTitles = new Set();
            const uniqueItems = combinedItems.filter(item => {
                if (!uniqueTitles.has(item.title)) {
                    uniqueTitles.add(item.title);
                    return true;
                }
                return false;
            });
    
            // Acak urutan berita untuk variasi
            const shuffledItems = uniqueItems.sort(() => 0.5 - Math.random());
    
            loadingIndicator.style.display = 'none';
            newsContainer.innerHTML = '';
    
            shuffledItems.slice(0, 12).forEach((item, index) => { // Tampilkan hingga 12 berita
                // Ekstrak deskripsi bersih dari HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description;
                const source = tempDiv.querySelector('a')?.textContent || 'Sumber Tidak Diketahui';

                // Tentukan ikon bendera berdasarkan asal berita
                const flagIcon = item.origin === 'indonesia'
                    ? `<span class="inline-block w-5 h-3 mr-2" style="background: linear-gradient(to bottom, #CE1126 50%, #FFFFFF 50%); border: 1px solid #ddd;" title="Indonesia"></span>`
                    : `<i class="fas fa-globe-americas mr-2" title="Internasional"></i>`;

                const newsCard = `
                    <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="block animate-on-scroll" style="animation-delay: ${index * 150 + 600}ms;">
                        <article class="manuscript-item h-full">
                            <div class="flex-grow">
                                <div class="flex items-center text-sm text-[var(--accent-teal)] font-bold mb-2">
                                    ${flagIcon}
                                    <span>${source.toUpperCase()}</span>
                                </div>
                                <h4 class="manuscript-title" style="font-size: 1.5rem;">${item.title}</h4>
                            </div>
                        </article>
                    </a>
                `;
                newsContainer.innerHTML += newsCard;
            });
    
            // Re-observe new elements for animation
            // (Asumsi 'animateOnScrollObserver' tersedia secara global dari script.js)
            if (window.animateOnScrollObserver) {
                newsContainer.querySelectorAll('.animate-on-scroll').forEach(el => {
                    window.animateOnScrollObserver.observe(el);
                });
            }
    
        } catch (error) {
            console.error("Gagal mengambil berita:", error);
            loadingIndicator.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> Gagal memuat berita. Silakan coba lagi nanti.`;
        }
    }

    // Panggil fungsi untuk pertama kali
    fetchAndRenderTechNews('all');

    // Tambahkan event listener untuk tombol kategori
    const categoryButtons = document.querySelectorAll('.news-category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Cek apakah yang diklik adalah tombol refresh
            if(button.id === 'refresh-news-btn') {
                const activeCategory = document.querySelector('.news-category-btn.active')?.dataset.category || 'all';
                fetchAndRenderTechNews(activeCategory);
            } else {
                const selectedCategory = button.dataset.category;
                // Perbarui tampilan tombol aktif
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                fetchAndRenderTechNews(selectedCategory);
            }
        });
    });

    // --- BARU: PEMBARUAN BERITA OTOMATIS ---
    // Set interval untuk memuat ulang berita setiap 24 jam (86400000 milidetik)
    setInterval(() => {
        const activeCategory = document.querySelector('.news-category-btn.active')?.dataset.category || 'all';
        fetchAndRenderTechNews(activeCategory);
    }, 86400000);
});