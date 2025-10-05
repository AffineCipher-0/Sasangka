document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('#sertifikat-modal-content');
    
    // Jika tidak ada kontainer galeri, hentikan eksekusi skrip ini.
    if (!galleryContainer) {
        return;
    }

    const certificates = [
        { src: "https://i.imgur.com/kKZz1sp.png", alt: "Sertifikat Ethical Hacker", title: "Dasar-Dasar Ethical Hacking", desc: "Digital Talent Scholarship - 2025" },
        { src: "https://i.imgur.com/wZ7owwo.png", alt: "Sertifikat Magang DLHK DIY", title: "Magang DLHK DIY", desc: "Dinas Lingkungan Hidup & Kehutanan DIY - 2024" },
        { src: "https://i.imgur.com/fgV6iQP.png", alt: "Sertifikat Literasi Digital", title: "Literasi Digital", desc: "Kemkominfo - 2023" },
        { src: "https://i.imgur.com/eyW5LUw.png", alt: "Sertifikat Seminar Cyber Security", title: "Seminar Keamanan Siber", desc: "HIMATEKNO FTTI UNJAYA - 2023" },
        { src: "https://i.imgur.com/fRg3hmp.png", alt: "Sertifikat Webinar Pengolahan Data", title: "Webinar Pengolahan Data", desc: "XREI Institute - 2023" },
        { src: "https://i.imgur.com/ltwjESR.png", alt: "Sertifikat Keamanan CCNA", title: "Keamanan CCNA", desc: "Cisco Networking Academy - 2022" },
        { src: "https://i.imgur.com/iCRbLK8.png", alt: "Sertifikat Switching, Routing, & Nirkabel", title: "Switching, Routing, & Nirkabel", desc: "Cisco Networking Academy - 2021" },
        { src: "https://i.imgur.com/5frcsDW.png", alt: "Sertifikat Pengenalan Jaringan", title: "Pengenalan Jaringan", desc: "Cisco Networking Academy - 2021" },
        { src: "https://i.imgur.com/zruR3Gv.png", alt: "Sertifikat Dasar-dasar Python", title: "Dasar-dasar Python", desc: "Progate - 2021" },
        { src: "https://i.imgur.com/Pqwf8N1.png", alt: "Sertifikat Dasar-dasar TI", title: "Dasar-Dasar Teknologi Informasi", desc: "Cisco Networking Academy - 2020" }
    ];

    galleryContainer.innerHTML = certificates.map(cert => `
        <button data-modal-target="#image-viewer-modal" data-src="${cert.src}" class="block border-2 border-[var(--border-gold)] hover:border-[var(--accent-teal)] transition-all duration-300 p-2 group text-left certificate-item">
            <div class="relative">
                <img src="${cert.src}" alt="${cert.alt}" class="w-full h-auto object-cover certificate-image" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/400x300/1a2a44/e0d8c8?text=Error';">
               <div class="certificate-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="mb-2" viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>
                    <span class="text-sm font-semibold">Lihat Detail</span>
               </div>
            </div>
            <p class="text-center text-sm mt-2 font-semibold">${cert.title}</p>
            <p class="text-center text-xs">${cert.desc}</p>
        </button>
    `).join('');
});