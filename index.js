const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

function cariKombinasi(bobot, nilaiAkhir) {
    let kombinasi = new Array(bobot.length).fill(0); // Inisialisasi kombinasi awal
    let totalTerpakai = 0;

    // Urutkan indeks berdasarkan bobot tertinggi ke terendah
    let indeksTerurut = bobot.map((b, i) => ({ index: i, bobot: b }))
                             .filter(item => item.bobot > 0) // Abaikan bobot 0
                             .sort((a, b) => b.bobot - a.bobot) // Urutkan dari terbesar ke terkecil
                             .map(item => item.index);

    // Pilih nilai dari 40 sampai 95 saja (increment 1)
    let pilihanNilai = Array.from({ length: 95 - 40 + 1 }, (_, i) => 40 + i);

    // Looping sampai kombinasi ditemukan
    let maxAttempts = 1000; // Hindari infinite loop
    let attempt = 0;
    let kombinasiValid = null;

    do {
        kombinasi.fill(0); // Reset kombinasi setiap iterasi
        totalTerpakai = 0;

        // Acak urutan nilai yang akan dicoba untuk variasi
        pilihanNilai = pilihanNilai.sort(() => Math.random() - 0.5);

        // Coba mengisi nilai berdasarkan bobot tertinggi lebih dulu
        for (let i of indeksTerurut) {
            let nilaiMaks = (nilaiAkhir * bobot[i]) / 100;

            // Pilih nilai yang masih memungkinkan
            for (let nilai of pilihanNilai) {
                let kontribusi = (nilai * bobot[i]) / 100;
                if (totalTerpakai + kontribusi <= nilaiAkhir) {
                    kombinasi[i] = nilai;
                    totalTerpakai += kontribusi;
                    break; // Pilih satu nilai dan lanjutkan
                }
            }
        }

        // Jika total sesuai, simpan hasilnya
        if (Math.abs(totalTerpakai - nilaiAkhir) < 0.001) {
            kombinasiValid = [...kombinasi];
        }

        attempt++;
    } while (!kombinasiValid && attempt < maxAttempts);

    return kombinasiValid || [];
}

// =======================
// 1. Endpoint API untuk menerima bobot dan nilai akhir dari frontend
// =======================
app.post("/hitung-kombinasi", (req, res) => {
    try {
        console.log("Menerima request:", req.body);

        let { bobot, nilaiAkhir } = req.body;

        if (!bobot || !nilaiAkhir) {
            return res.status(400).json({ error: "Bobot dan nilai akhir harus diisi!" });
        }

        // Konversi bobot dari string ke array angka
        bobot = bobot.split(",").map(num => parseFloat(num.trim()));
        nilaiAkhir = parseFloat(nilaiAkhir);

        console.log("Bobot setelah konversi:", bobot);
        console.log("Nilai Akhir setelah konversi:", nilaiAkhir);

        let kombinasi = cariKombinasi(bobot, nilaiAkhir);

        console.log("Hasil kombinasi:", kombinasi);

        res.json({ kombinasi });
    } catch (error) {
        console.error("Error dalam perhitungan kombinasi:", error);
        res.status(500).json({ error: "Terjadi kesalahan pada server" });
    }
});

// =======================
// 2. Jalankan server Express di port 3000
// =======================
app.listen(3000, () => {
    console.log("✅ Server berjalan di http://localhost:3000");
});
