/* =========================
   DATA DAN PENYIMPANAN
========================= */

// Nama tempat penyimpanan pada browser.
const KUNCI_PENYIMPANAN = "ruangaksi-relawan-v2";

// Data contoh fiktif untuk tampilan awal.
const dataContoh = [
    {
        id: "demo-1",
        nama: "Alya Putri",
        nim: "DEMO001",
        prodi: "Sistem Informasi",
        kegiatan: "Kampus Bersih, Bumi Sehat",
        peran: "Relawan lapangan",
        motivasi: "",
        hadir: false,
        demo: true
    },
    {
        id: "demo-2",
        nama: "Rafi Pratama",
        nim: "DEMO002",
        prodi: "Informatika",
        kegiatan: "Teman Belajar Digital",
        peran: "Fasilitator",
        motivasi: "",
        hadir: true,
        demo: true
    },
    {
        id: "demo-3",
        nama: "Nadia Safitri",
        nim: "DEMO003",
        prodi: "Sistem Informasi",
        kegiatan: "Pojok Baca Bergerak",
        peran: "Dokumentasi",
        motivasi: "",
        hadir: false,
        demo: true
    }
];

// Membaca data yang pernah disimpan.
function bacaData() {
    try {
        const dataTersimpan = localStorage.getItem(KUNCI_PENYIMPANAN);

        if (dataTersimpan !== null) {
            const hasil = JSON.parse(dataTersimpan);

            // Memastikan data tersimpan memiliki struktur yang sesuai.
            const valid = Array.isArray(hasil) && hasil.every(function (item) {
                return (
                    item !== null &&
                    typeof item === "object" &&
                    typeof item.id === "string" &&
                    typeof item.nama === "string" &&
                    typeof item.nim === "string" &&
                    typeof item.prodi === "string" &&
                    typeof item.kegiatan === "string" &&
                    typeof item.peran === "string" &&
                    typeof item.hadir === "boolean"
                );
            });

            if (valid) {
                return hasil;
            }
        }
    } catch (error) {
        console.warn("Data browser tidak dapat dibaca.", error);
    }

    // Membuat salinan agar data awal tidak berubah.
    return dataContoh.map(function (item) {
        return { ...item };
    });
}

let dataRelawan = bacaData();

// Menyimpan seluruh data ke localStorage.
function simpanData() {
    try {
        localStorage.setItem(
            KUNCI_PENYIMPANAN,
            JSON.stringify(dataRelawan)
        );

        return true;
    } catch (error) {
        console.warn("Data tidak dapat disimpan.", error);
        return false;
    }
}

/* =========================
   MENGAMBIL ELEMEN HTML
========================= */

const formRelawan = document.getElementById("form-relawan");
const tabelRelawan = document.getElementById("tabel-relawan");
const inputPencarian = document.getElementById("pencarian");
const filterKegiatan = document.getElementById("filter-kegiatan");
const pesan = document.getElementById("pesan");

const totalRelawan = document.getElementById("total-relawan");
const totalHadir = document.getElementById("total-hadir");
const jumlahTampil = document.getElementById("jumlah-tampil");

/* =========================
   FUNGSI BANTU
========================= */

function tampilkanPesan(teks, error = false) {
    pesan.textContent = teks;
    pesan.classList.toggle("error", error);
}

// Menggunakan textContent agar input ditampilkan sebagai teks.
function buatElemen(namaTag, teks) {
    const elemen = document.createElement(namaTag);
    elemen.textContent = teks;
    return elemen;
}

function buatId() {
    return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 10)
    );
}

function perbaruiStatistik() {
    totalRelawan.textContent = dataRelawan.length;

    const relawanHadir = dataRelawan.filter(function (relawan) {
        return relawan.hadir;
    });

    totalHadir.textContent = relawanHadir.length;
}

/* =========================
   MENAMPILKAN TABEL
========================= */

function tampilkanData() {
    const kataKunci = inputPencarian.value.trim().toLowerCase();
    const kegiatanDipilih = filterKegiatan.value;

    const hasilFilter = dataRelawan.filter(function (relawan) {
        const teksPencarian = (
            relawan.nama +
            " " +
            relawan.nim +
            " " +
            relawan.prodi
        ).toLowerCase();

        const cocokPencarian = teksPencarian.includes(kataKunci);

        const cocokKegiatan =
            kegiatanDipilih === "" ||
            relawan.kegiatan === kegiatanDipilih;

        return cocokPencarian && cocokKegiatan;
    });

    // Menghapus tampilan tabel sebelumnya.
    tabelRelawan.replaceChildren();

    hasilFilter.forEach(function (relawan, index) {
        const baris = document.createElement("tr");

        // Kolom nomor.
        const kolomNomor = buatElemen("td", index + 1);

        // Kolom nama dan NIM.
        const kolomNama = buatElemen("td", relawan.nama);

        const teksNim = relawan.demo
            ? relawan.nim + " · Demo"
            : relawan.nim;

        kolomNama.appendChild(buatElemen("small", teksNim));

        // Kolom program studi.
        const kolomProdi = buatElemen("td", relawan.prodi);

        // Kolom kegiatan dan peran.
        const kolomKegiatan = buatElemen("td", relawan.kegiatan);

        kolomKegiatan.appendChild(
            buatElemen("small", relawan.peran)
        );

        // Kolom kehadiran.
        const kolomKehadiran = document.createElement("td");

        const tombolKehadiran = buatElemen(
            "button",
            relawan.hadir ? "✓ Hadir" : "○ Belum hadir"
        );

        tombolKehadiran.type = "button";
        tombolKehadiran.className = "status-button";

        if (relawan.hadir) {
            tombolKehadiran.classList.add("present");
        }

        tombolKehadiran.setAttribute(
            "aria-label",
            "Ubah kehadiran " + relawan.nama
        );

        tombolKehadiran.setAttribute(
            "aria-pressed",
            String(relawan.hadir)
        );

        tombolKehadiran.addEventListener("click", function () {
            ubahKehadiran(relawan.id);
        });

        kolomKehadiran.appendChild(tombolKehadiran);

        // Kolom aksi hapus.
        const kolomAksi = document.createElement("td");

        const tombolHapus = buatElemen("button", "Hapus");
        tombolHapus.type = "button";
        tombolHapus.className = "delete-button";

        tombolHapus.setAttribute(
            "aria-label",
            "Hapus pendaftaran " + relawan.nama
        );

        tombolHapus.addEventListener("click", function () {
            hapusRelawan(relawan.id);
        });

        kolomAksi.appendChild(tombolHapus);

        // Menggabungkan seluruh kolom ke baris.
        baris.append(
            kolomNomor,
            kolomNama,
            kolomProdi,
            kolomKegiatan,
            kolomKehadiran,
            kolomAksi
        );

        tabelRelawan.appendChild(baris);
    });

    // Pesan ketika tidak ada hasil.
    if (hasilFilter.length === 0) {
        const barisKosong = document.createElement("tr");

        const kolomKosong = buatElemen(
            "td",
            "Belum ada data yang sesuai. Silakan daftar atau ubah pencarian."
        );

        kolomKosong.colSpan = 6;
        kolomKosong.className = "empty-state";

        barisKosong.appendChild(kolomKosong);
        tabelRelawan.appendChild(barisKosong);
    }

    jumlahTampil.textContent = hasilFilter.length;
    perbaruiStatistik();
}

/* =========================
   PENDAFTARAN RELAWAN
========================= */

formRelawan.addEventListener("submit", function (event) {
    // Mencegah halaman dimuat ulang saat form dikirim.
    event.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const nim = document.getElementById("nim").value.trim();
    const prodi = document.getElementById("prodi").value.trim();

    const kegiatan = document.getElementById(
        "pilihan-kegiatan"
    ).value;

    const peran = document.getElementById("peran").value;

    const motivasi = document.getElementById(
        "motivasi"
    ).value.trim();

    const setuju = document.getElementById(
        "persetujuan"
    ).checked;

    // Validasi kolom wajib.
    if (
        nama === "" ||
        nim === "" ||
        prodi === "" ||
        kegiatan === "" ||
        peran === ""
    ) {
        tampilkanPesan(
            "Lengkapi semua kolom yang wajib diisi.",
            true
        );

        return;
    }

    // Memastikan NIM terdiri dari 6–20 angka.
    if (!/^[0-9]{6,20}$/.test(nim)) {
        tampilkanPesan(
            "NIM harus terdiri dari 6 sampai 20 angka.",
            true
        );

        return;
    }

    if (!setuju) {
        tampilkanPesan(
            "Centang persetujuan terlebih dahulu.",
            true
        );

        return;
    }

    // Mencegah NIM yang sama mendaftar kegiatan yang sama.
    const sudahTerdaftar = dataRelawan.some(function (relawan) {
        return (
            relawan.nim === nim &&
            relawan.kegiatan === kegiatan
        );
    });

    if (sudahTerdaftar) {
        tampilkanPesan(
            "NIM tersebut sudah terdaftar pada kegiatan yang sama.",
            true
        );

        return;
    }

    const relawanBaru = {
        id: buatId(),
        nama: nama,
        nim: nim,
        prodi: prodi,
        kegiatan: kegiatan,
        peran: peran,
        motivasi: motivasi,
        hadir: false,
        demo: false
    };

    dataRelawan.push(relawanBaru);

    const berhasilDisimpan = simpanData();

    // Mengosongkan form setelah pendaftaran.
    formRelawan.reset();

    // Menghapus filter agar data baru langsung terlihat.
    inputPencarian.value = "";
    filterKegiatan.value = "";

    tampilkanData();

    if (berhasilDisimpan) {
        tampilkanPesan(
            "Pendaftaran berhasil! Data kamu sudah masuk ke tabel relawan."
        );
    } else {
        tampilkanPesan(
            "Data tampil sementara, tetapi penyimpanan browser tidak tersedia. " +
            "Data dapat hilang saat halaman ditutup.",
            true
        );
    }
});

formRelawan.addEventListener("reset", function () {
    tampilkanPesan("");
});

/* =========================
   MENGUBAH KEHADIRAN
========================= */

function ubahKehadiran(id) {
    const relawan = dataRelawan.find(function (item) {
        return item.id === id;
    });

    if (!relawan) {
        return;
    }

    relawan.hadir = !relawan.hadir;

    const berhasilDisimpan = simpanData();

    tampilkanData();

    if (!berhasilDisimpan) {
        tampilkanPesan(
            "Status berubah sementara, tetapi gagal disimpan ke browser.",
            true
        );
    }
}

/* =========================
   MENGHAPUS RELAWAN
========================= */

function hapusRelawan(id) {
    const relawan = dataRelawan.find(function (item) {
        return item.id === id;
    });

    if (!relawan) {
        return;
    }

    const konfirmasi = confirm(
        "Hapus pendaftaran atas nama " + relawan.nama + "?"
    );

    if (!konfirmasi) {
        return;
    }

    dataRelawan = dataRelawan.filter(function (item) {
        return item.id !== id;
    });

    const berhasilDisimpan = simpanData();

    tampilkanData();

    if (!berhasilDisimpan) {
        tampilkanPesan(
            "Data dihapus dari tampilan, tetapi perubahan gagal disimpan.",
            true
        );
    }
}

/* =========================
   PENCARIAN DAN FILTER
========================= */

inputPencarian.addEventListener("input", tampilkanData);
filterKegiatan.addEventListener("change", tampilkanData);

/* =========================
   TOMBOL IKUT AKSI
========================= */

const tombolIkutAksi = document.querySelectorAll(
    "[data-kegiatan]"
);

tombolIkutAksi.forEach(function (tombol) {
    tombol.addEventListener("click", function () {
        const kegiatan = tombol.dataset.kegiatan;

        document.getElementById(
            "pilihan-kegiatan"
        ).value = kegiatan;

        document.getElementById(
            "pendaftaran"
        ).scrollIntoView();

        document.getElementById("nama").focus({
            preventScroll: true
        });
    });
});

/* =========================
   UNDUH DATA CSV
========================= */

// Membungkus nilai CSV serta mengamankan karakter khusus.
function nilaiCSV(nilai) {
    let teks = String(nilai ?? "");

    // Mencegah input dibaca sebagai formula spreadsheet.
    if (/^\s*[=+\-@]/.test(teks) || /^[\t\r\n]/.test(teks)) {
        teks = "'" + teks;
    }

    teks = teks.replace(/"/g, '""');

    return '"' + teks + '"';
}

document.getElementById("unduh-csv").addEventListener(
    "click",
    function () {
        const barisCSV = [
            [
                "Nama",
                "NIM",
                "Program Studi",
                "Kegiatan",
                "Peran",
                "Kehadiran",
                "Jenis Data"
            ]
        ];

        dataRelawan.forEach(function (relawan) {
            barisCSV.push([
                relawan.nama,
                relawan.nim,
                relawan.prodi,
                relawan.kegiatan,
                relawan.peran,
                relawan.hadir ? "Hadir" : "Belum hadir",
                relawan.demo ? "Demo" : "Pendaftaran"
            ]);
        });

        const isiCSV = barisCSV.map(function (baris) {
            return baris.map(nilaiCSV).join(",");
        }).join("\r\n");

        const file = new Blob(
            ["\uFEFF" + isiCSV],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const alamatFile = URL.createObjectURL(file);

        const tautan = document.createElement("a");
        tautan.href = alamatFile;
        tautan.download = "data-relawan-ruangaksi.csv";

        document.body.appendChild(tautan);
        tautan.click();
        tautan.remove();

        setTimeout(function () {
            URL.revokeObjectURL(alamatFile);
        }, 1000);
    }
);

/* =========================
   MENU NAVIGASI
========================= */

const menuNavigasi = document.querySelectorAll(".nav-link");

menuNavigasi.forEach(function (menu) {
    menu.addEventListener("click", function () {
        menuNavigasi.forEach(function (item) {
            item.classList.remove("active");
        });

        menu.classList.add("active");
    });
});

/* =========================
   TAMPILAN AWAL
========================= */

tampilkanData();