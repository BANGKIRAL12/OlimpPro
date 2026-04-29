import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, HelpCircle, Key, RefreshCcw, CheckCircle2, 
  XCircle, ChevronRight, Target, Award, Home, 
  BrainCircuit, GraduationCap, ChevronLeft, BarChart3, Star, Zap, ShieldCheck,
  Calculator, Pi, FunctionSquare, LayoutGrid, Gem, Crown, Flame, Microscope, Globe2, BookOpen
} from 'lucide-react';

/**
 * FORMAT PENGISIAN SOAL:
 * Copy-paste struktur di bawah ini ke dalam kategori yang sesuai.
 * { 
 * id: 'unik-123', 
 * bidang: 'Nama Sub-Bab', 
 * pertanyaan: 'Gunakan $...$ untuk simbol matematika', 
 * jawabanBenar: 'Jawaban', 
 * opsiLain: ['Salah1', 'Salah2', 'Salah3'], 
 * pembahasan: 'Penjelasan singkat' 
 * }
 */

const SOAL_DATABASE = {
  matematika: {
    sd: {
      kabupaten: [
  {
    id: 'sdk3',
    bidang: 'Aljabar',
    pertanyaan: "Jika $3n + 7 = 22$, nilai dari $n - 2$ adalah...",
    jawabanBenar: "3",
    opsiLain: ["5", "15", "7"],
    pembahasan: "$3n = 22 - 7 \\implies 3n = 15 \\implies n = 5$. Maka $n - 2 = 5 - 2 = 3$."
  },
  {
    id: 'sdk4',
    bidang: 'Teori Bilangan',
    pertanyaan: "Banyaknya bilangan bulat positif kurang dari 100 yang habis dibagi 3 tetapi tidak habis dibagi 5 adalah...",
    jawabanBenar: "27",
    opsiLain: ["33", "20", "26"],
    pembahasan: "Bilangan kelipatan 3 kurang dari 100 adalah $99 / 3 = 33$. Bilangan yang habis dibagi 3 dan 5 (kelipatan 15) adalah $15, 30, 45, 60, 75, 90$ (ada 6 buah). Jadi, $33 - 6 = 27$."
  },
  {
    id: 'sdk5',
    bidang: 'Geometri',
    pertanyaan: "Sebuah persegi memiliki luas $144 \\text{ cm}^2$. Jika panjang sisinya diperpanjang sebesar 25%, maka luas persegi yang baru adalah... $\\text{cm}^2$",
    jawabanBenar: "225",
    opsiLain: ["180", "200", "250"],
    pembahasan: "Sisi awal $= \\sqrt{144} = 12$. Sisi baru $= 12 + (25\\% \\times 12) = 12 + 3 = 15$. Luas baru $= 15 \\times 15 = 225 \\text{ cm}^2$."
  },
  {
    id: 'sdk6',
    bidang: 'Statistik',
    pertanyaan: "Rata-rata nilai matematika 5 siswa adalah 80. Jika digabungkan dengan nilai Andi, rata-ratanya menjadi 82. Nilai Andi adalah...",
    jawabanBenar: "92",
    opsiLain: ["85", "90", "88"],
    pembahasan: "Total nilai 5 siswa $= 5 \\times 80 = 400$. Total nilai 6 siswa $= 6 \\times 82 = 492$. Nilai Andi $= 492 - 400 = 92$."
  },
  {
    id: 'sdk7',
    bidang: 'Kombinatorika',
    pertanyaan: "Dalam sebuah ruangan terdapat 6 orang yang saling berjabat tangan satu sama lain tepat satu kali. Banyaknya jabat tangan yang terjadi adalah...",
    jawabanBenar: "15",
    opsiLain: ["30", "12", "36"],
    pembahasan: "Gunakan rumus jabat tangan: $n(n-1)/2$. Maka $6(5)/2 = 30/2 = 15$."
  },
  {
    id: 'sdk8',
    bidang: 'Teori Bilangan',
    pertanyaan: "Hasil kali tiga bilangan prima pertama yang lebih besar dari 10 adalah...",
    jawabanBenar: "2431",
    opsiLain: ["4199", "3003", "4500"],
    pembahasan: "Tiga bilangan prima setelah 10 adalah 11, 13, dan 17. Hasil kalinya: $11 \\times 13 \\times 17 = 2431$."
  },
  {
    id: 'sdk9',
    bidang: 'Aljabar',
    pertanyaan: "Diberikan operasi $a \\ast b = (a + b) \\times (a - b)$. Nilai dari $10 \\ast 8$ adalah...",
    jawabanBenar: "36",
    opsiLain: ["18", "2", "64"],
    pembahasan: "$10 \\ast 8 = (10 + 8) \\times (10 - 8) = 18 \\times 2 = 36$."
  },
  {
    id: 'sdk10',
    bidang: 'Geometri',
    pertanyaan: "Sudut terkecil yang dibentuk oleh kedua jarum jam pada pukul 04.00 adalah...",
    jawabanBenar: "120",
    opsiLain: ["90", "100", "150"],
    pembahasan: "Setiap lompatan angka jam bernilai $30^\\circ$. Dari angka 12 ke 4 ada 4 lompatan, maka $4 \\times 30^\\circ = 120^\\circ$."
  },
  {
    id: 'sdk11',
    bidang: 'Teori Bilangan',
    pertanyaan: "Sisa pembagian $2^{2026}$ oleh 10 adalah...",
    jawabanBenar: "4",
    opsiLain: ["2", "6", "8"],
    pembahasan: "Pola angka satuan $2^n$: $2^1=2, 2^2=4, 2^3=8, 2^4=6, 2^5=2$. Pola berulang setiap 4 kali. $2026 \\div 4$ sisa 2. Maka angka satuannya sama dengan $2^2 = 4$."
  },
  {
    id: 'sdk12',
    bidang: 'Kombinatorika',
    pertanyaan: "Banyaknya susunan huruf berbeda yang dapat dibentuk dari kata 'MAMA' adalah...",
    jawabanBenar: "6",
    opsiLain: ["12", "24", "4"],
    pembahasan: "Menggunakan permutasi dengan unsur sama: $4! / (2! \\times 2!) = 24 / 4 = 6$."
  },
  {
    id: 'sdk13',
    bidang: 'Aljabar',
    pertanyaan: "Jika $x + y = 10$ dan $x - y = 4$, maka nilai dari $x^2 - y^2$ adalah...",
    jawabanBenar: "40",
    opsiLain: ["14", "100", "16"],
    pembahasan: "Ingat selisih dua kuadrat: $x^2 - y^2 = (x+y)(x-y)$. Maka $10 \\times 4 = 40$."
  },
  {
    id: 'sdk14',
    bidang: 'Geometri',
    pertanyaan: "Sebuah segitiga memiliki alas 12 cm dan luas 48 cm². Tinggi segitiga tersebut adalah... cm",
    jawabanBenar: "8",
    opsiLain: ["4", "6", "12"],
    pembahasan: "$L = (a \\times t) / 2 \\implies 48 = (12 \\times t) / 2 \\implies 48 = 6t \\implies t = 8$."
  },
  {
    id: 'sdk15',
    bidang: 'Teori Bilangan',
    pertanyaan: "Bilangan terkecil yang jika dibagi 4 sisa 3, dibagi 5 sisa 4, dan dibagi 6 sisa 5 adalah...",
    jawabanBenar: "59",
    opsiLain: ["60", "61", "119"],
    pembahasan: "Selisih antara pembagi dan sisa selalu 1 ($4-3=1, 5-4=1, 6-5=1$). Cari KPK(4,5,6) lalu kurangi 1. KPK(4,5,6) $= 60$. Bilangan $= 60 - 1 = 59$."
  },
  {
    id: 'sdk16',
    bidang: 'Aljabar',
    pertanyaan: "Berapakah hasil dari $1 - 2 + 3 - 4 + 5 - 6 + \\dots + 99 - 100$?",
    jawabanBenar: "-50",
    opsiLain: ["50", "0", "-100"],
    pembahasan: "Kelompokkan berpasangan: $(1-2) + (3-4) + \\dots + (99-100)$. Ada 50 pasangan yang masing-masing bernilai $-1$. Jadi, $50 \\times (-1) = -50$."
  },
  {
    id: 'sdk17',
    bidang: 'Statistik',
    pertanyaan: "Nilai rata-rata dari 4 bilangan adalah 7. Jika selisih bilangan terbesar dan terkecil adalah 4, dan dua bilangan lainnya adalah 7, bilangan terbesarnya adalah...",
    jawabanBenar: "9",
    opsiLain: ["8", "10", "11"],
    pembahasan: "Jumlah total $= 4 \\times 7 = 28$. Misal bilangan itu $x, 7, 7, y$. Maka $x + 14 + y = 28 \\implies x + y = 14$. Diketahui $y - x = 4$. Dengan eliminasi, $2y = 18 \\implies y = 9$."
  },
  {
    id: 'sdk18',
    bidang: 'Geometri',
    pertanyaan: "Sebuah kubus memiliki panjang diagonal sisi $\\sqrt{50}$ cm. Volume kubus tersebut adalah... $\\text{cm}^3$",
    jawabanBenar: "125",
    opsiLain: ["25", "150", "625"],
    pembahasan: "Diagonal sisi $= s\\sqrt{2} = \\sqrt{50} = 5\\sqrt{2}$. Maka $s = 5$. Volume $= 5^3 = 125$."
  },
  {
    id: 'sdk19',
    bidang: 'Teori Bilangan',
    pertanyaan: "Berapakah faktor persekutuan terbesar (FPB) dari 72 dan 108?",
    jawabanBenar: "36",
    opsiLain: ["18", "24", "12"],
    pembahasan: "$72 = 2^3 \\times 3^2$ dan $108 = 2^2 \\times 3^3$. FPB $= 2^2 \\times 3^2 = 4 \\times 9 = 36$."
  },
  {
    id: 'sdk20',
    bidang: 'Aljabar',
    pertanyaan: "Jika $f(x) = 2x - 3$, maka nilai dari $f(f(5))$ adalah...",
    jawabanBenar: "11",
    opsiLain: ["7", "10", "13"],
    pembahasan: "$f(5) = 2(5) - 3 = 7$. Maka $f(f(5)) = f(7) = 2(7) - 3 = 11$."
  },
  {
    id: 'sdk21',
    bidang: 'Kombinatorika',
    pertanyaan: "Dua buah dadu dilempar bersamaan. Peluang muncul mata dadu berjumlah 10 adalah...",
    jawabanBenar: "3/36",
    opsiLain: ["1/36", "4/36", "2/36"],
    pembahasan: "Pasangan mata dadu berjumlah 10: $(4,6), (5,5), (6,4)$. Total ada 3 kemungkinan dari $6 \\times 6 = 36$ total ruang sampel."
  },
  {
    id: 'sdk22',
    bidang: 'Geometri',
    pertanyaan: "Keliling sebuah lingkaran adalah 44 cm (gunakan $\\pi = 22/7$). Luas lingkaran tersebut adalah... $\\text{cm}^2$",
    jawabanBenar: "154",
    opsiLain: ["144", "164", "616"],
    pembahasan: "$K = 2 \\times 22/7 \\times r = 44 \\implies 44/7 \\times r = 44 \\implies r = 7$. Luas $= 22/7 \\times 7 \\times 7 = 154$."
  },
  {
    id: 'sdk23',
    bidang: 'Teori Bilangan',
    pertanyaan: "Berapa banyak angka 0 berurutan di akhir dari hasil perkalian $1 \\times 2 \\times 3 \\times \\dots \\times 25$?",
    jawabanBenar: "6",
    opsiLain: ["4", "5", "10"],
    pembahasan: "Banyak nol ditentukan oleh faktor 5. Dalam 1-25 terdapat kelipatan 5 (5, 10, 15, 20) dan satu kelipatan 25 ($5 \\times 5$). Total faktor 5 adalah $4 + 2 = 6$."
  },
  {
    id: 'sdk24',
    bidang: 'Aljabar',
    pertanyaan: "Tentukan nilai dari $\\sqrt{20 + \\sqrt{20 + \\sqrt{20 + \\dots}}}$ adalah...",
    jawabanBenar: "5",
    opsiLain: ["4", "6", "20"],
    pembahasan: "Misal $x = \\sqrt{20+x}$. Maka $x^2 = 20 + x \\implies x^2 - x - 20 = 0$. Faktornya $(x-5)(x+4)=0$. Karena nilai akar harus positif, maka $x = 5$."
  },
  {
    id: 'sdk25',
    bidang: 'Geometri',
    pertanyaan: "Banyaknya diagonal ruang pada sebuah prisma segi enam adalah...",
    jawabanBenar: "18",
    opsiLain: ["6", "12", "9"],
    pembahasan: "Rumus diagonal ruang prisma segi-n: $n(n-3)$. Untuk segi enam, $6(6-3) = 6 \\times 3 = 18$."
  },
  {
    id: 'sdk26',
    bidang: 'Teori Bilangan',
    pertanyaan: "Bilangan $1A2B$ habis dibagi 9 dan 5. Jika $A$ dan $B$ berbeda, nilai $A + B$ terkecil adalah...",
    jawabanBenar: "6",
    opsiLain: ["5", "15", "9"],
    pembahasan: "Habis dibagi 5 maka $B$ bisa 0 atau 5. Jika $B=0$, agar habis dibagi 9 maka $1+A+2+0$ harus kelipatan 9 ($A=6, A+B=6$). Jika $B=5$, maka $1+A+2+5=8+A$ maka $A=1 (A+B=6$ juga)."
  },
  {
    id: 'sdk27',
    bidang: 'Aljabar',
    pertanyaan: "Harga 3 buku dan 2 pensil adalah Rp15.000. Harga 2 buku dan 1 pensil adalah Rp9.000. Harga 1 buku adalah...",
    jawabanBenar: "3000",
    opsiLain: ["2000", "4000", "2500"],
    pembahasan: "Eliminasi: $3B+2P=15000$ dan $4B+2P=18000$ (dikali 2). Selisihnya $1B = 3000$."
  },
  {
    id: 'sdk28',
    bidang: 'Logika',
    pertanyaan: "Jika hari ini Selasa, maka 100 hari yang lalu adalah hari...",
    jawabanBenar: "Minggu",
    opsiLain: ["Senin", "Sabtu", "Jumat"],
    pembahasan: "$100 \\pmod 7 = 2$ (sisa 2). Dua hari sebelum Selasa adalah Minggu."
  },
  {
    id: 'sdk29',
    bidang: 'Geometri',
    pertanyaan: "Sebuah balok memiliki perbandingan $p:l:t = 3:2:1$. Jika volumenya 48 cm³, maka tinggi balok adalah... cm",
    jawabanBenar: "2",
    opsiLain: ["1", "3", "4"],
    pembahasan: "$(3x)(2x)(x) = 48 \\implies 6x^3 = 48 \\implies x^3 = 8 \\implies x = 2$. Tinggi $= x = 2$."
  },
  {
    id: 'sdk30',
    bidang: 'Teori Bilangan',
    pertanyaan: "Banyaknya faktor positif dari bilangan 120 adalah...",
    jawabanBenar: "16",
    opsiLain: ["8", "12", "15"],
    pembahasan: "$120 = 2^3 \\times 3^1 \\times 5^1$. Banyak faktor $= (3+1)(1+1)(1+1) = 4 \\times 2 \\times 2 = 16$."
  },
  {
    id: 'sdk31',
    bidang: 'Kombinatorika',
    pertanyaan: "Budi memiliki 3 baju dan 4 celana berbeda. Banyaknya cara Budi berpakaian adalah...",
    jawabanBenar: "12",
    opsiLain: ["7", "1", "24"],
    pembahasan: "Aturan perkalian sederhana: $3 \\times 4 = 12$ cara."
  },
  {
    id: 'sdk32',
    bidang: 'Aljabar',
    pertanyaan: "Jika $x/y = 2/3$, maka nilai dari $(3x + 2y) / (3x - y)$ adalah...",
    jawabanBenar: "4",
    opsiLain: ["2", "3", "5"],
    pembahasan: "Misal $x=2, y=3$. Maka $(3(2) + 2(3)) / (3(2) - 3) = (6+6) / (6-3) = 12 / 3 = 4$."
  },
  {
    id: 'sdk33',
    bidang: 'Geometri',
    pertanyaan: "Luas permukaan kubus yang volumenya 64 cm³ adalah... $\\text{cm}^2$",
    jawabanBenar: "96",
    opsiLain: ["64", "16", "128"],
    pembahasan: "$s^3 = 64 \\implies s = 4$. Luas permukaan $= 6 \\times s^2 = 6 \\times 16 = 96$."
  },
  {
    id: 'sdk34',
    bidang: 'Teori Bilangan',
    pertanyaan: "Bilangan prima terkecil yang lebih besar dari 100 adalah...",
    jawabanBenar: "101",
    opsiLain: ["103", "107", "109"],
    pembahasan: "101 tidak habis dibagi 2, 3, 5, atau 7, sehingga ia adalah bilangan prima berikutnya setelah 100."
  },
  {
    id: 'sdk35',
    bidang: 'Statistik',
    pertanyaan: "Median dari data: 8, 3, 9, 4, 7, 5, 8, 6, 2 adalah...",
    jawabanBenar: "6",
    opsiLain: ["5", "7", "8"],
    pembahasan: "Data urut: 2, 3, 4, 5, 6, 7, 8, 8, 9. Data tengah (ke-5) adalah 6."
  },
  {
    id: 'sdk36',
    bidang: 'Aljabar',
    pertanyaan: "Hasil dari $1/2 + 1/4 + 1/8 + 1/16 + 1/32$ adalah...",
    jawabanBenar: "31/32",
    opsiLain: ["1", "15/16", "63/64"],
    pembahasan: "Samakan penyebut menjadi 32: $(16+8+4+2+1)/32 = 31/32$."
  },
  {
    id: 'sdk37',
    bidang: 'Geometri',
    pertanyaan: "Besar masing-masing sudut pada segitiga sama sisi adalah...",
    jawabanBenar: "60",
    opsiLain: ["90", "45", "30"],
    pembahasan: "Total sudut segitiga $= 180^\\circ$. Karena sama besar, $180 / 3 = 60^\\circ$."
  },
  {
    id: 'sdk38',
    bidang: 'Teori Bilangan',
    pertanyaan: "Angka terakhir dari $7^{10}$ adalah...",
    jawabanBenar: "9",
    opsiLain: ["7", "1", "3"],
    pembahasan: "Pola satuan 7: $7^1=7, 7^2=9, 7^3=3, 7^4=1$. Pola berulang tiap 4. $10 \\pmod 4 = 2$, maka satuannya adalah 9."
  },
  {
    id: 'sdk39',
    bidang: 'Logika',
    pertanyaan: "Andi lebih tua dari Budi. Cici lebih muda dari Budi. Siapa yang paling muda?",
    jawabanBenar: "Cici",
    opsiLain: ["Andi", "Budi", "Tidak diketahui"],
    pembahasan: "Urutan: Andi > Budi > Cici. Maka yang termuda adalah Cici."
  },
  {
    id: 'sdk40',
    bidang: 'Geometri',
    pertanyaan: "Berapa banyak titik sudut pada limas segi empat?",
    jawabanBenar: "5",
    opsiLain: ["4", "8", "6"],
    pembahasan: "4 titik di alas dan 1 titik puncak. Total 5."
  },
  {
    id: 'sdk41',
    bidang: 'Teori Bilangan',
    pertanyaan: "Jumlah dari 10 bilangan asli pertama ($1+2+\\dots+10$) adalah...",
    jawabanBenar: "55",
    opsiLain: ["45", "50", "65"],
    pembahasan: "Gunakan rumus $n(n+1)/2 = 10(11)/2 = 55$."
  },
  {
    id: 'sdk42',
    bidang: 'Statistik',
    pertanyaan: "Modus dari data: 5, 6, 7, 5, 8, 9, 5, 10 adalah...",
    jawabanBenar: "5",
    opsiLain: ["6", "7", "10"],
    pembahasan: "Angka 5 muncul 3 kali, paling sering dibanding angka lainnya."
  },
  {
    id: 'sdk43',
    bidang: 'Aljabar',
    pertanyaan: "Jika $2^x = 32$, maka nilai $x$ adalah...",
    jawabanBenar: "5",
    opsiLain: ["4", "6", "3"],
    pembahasan: "$2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$ (ada 5 faktor)."
  },
  {
    id: 'sdk44',
    bidang: 'Geometri',
    pertanyaan: "Sebuah taman berbentuk lingkaran berdiameter 14 m. Jarak antar pohon di sekeliling taman adalah 4 m. Banyak pohon adalah...",
    jawabanBenar: "11",
    opsiLain: ["44", "10", "12"],
    pembahasan: "$K = 22/7 \\times 14 = 44$ m. Banyak pohon $= 44 / 4 = 11$ pohon."
  },
  {
    id: 'sdk45',
    bidang: 'Teori Bilangan',
    pertanyaan: "FPB dari 36 dan 48 adalah...",
    jawabanBenar: "12",
    opsiLain: ["6", "18", "24"],
    pembahasan: "Faktor 36: 1, 2, 3, 4, 6, 9, 12, 18, 36. Faktor 48: 1, 2, 3, 4, 6, 8, 12, 16, 24, 48. Faktor persekutuan terbesar adalah 12."
  },
  {
    id: 'sdk46',
    bidang: 'Kombinatorika',
    pertanyaan: "Dalam satu set kartu bridge (tanpa joker), peluang terambilnya kartu As adalah...",
    jawabanBenar: "4/52",
    opsiLain: ["1/52", "1/13", "13/52"],
    pembahasan: "Ada 4 kartu As dalam total 52 kartu."
  },
  {
    id: 'sdk47',
    bidang: 'Geometri',
    pertanyaan: "Luas sebuah belah ketupat adalah 24 cm². Jika panjang salah satu diagonalnya 6 cm, panjang diagonal lainnya adalah... cm",
    jawabanBenar: "8",
    opsiLain: ["4", "6", "12"],
    pembahasan: "$L = (d1 \\times d2) / 2 \\implies 24 = (6 \\times d2) / 2 \\implies 24 = 3 \\times d2 \\implies d2 = 8$."
  },
  {
    id: 'sdk48',
    bidang: 'Aljabar',
    pertanyaan: "Hasil dari $(100-1) \\times (100-2) \\times \\dots \\times (100-150)$ adalah...",
    jawabanBenar: "0",
    opsiLain: ["100", "5050", "-1000"],
    pembahasan: "Dalam urutan perkalian tersebut akan ada suku $(100-100)$ yang bernilai 0. Berapapun dikalikan 0 hasilnya adalah 0."
  },
  {
    id: 'sdk49',
    bidang: 'Teori Bilangan',
    pertanyaan: "Banyaknya bilangan prima antara 1 sampai 20 adalah...",
    jawabanBenar: "8",
    opsiLain: ["7", "9", "10"],
    pembahasan: "Bilangan primanya: 2, 3, 5, 7, 11, 13, 17, 19."
  },
  {
    id: 'sdk50',
    bidang: 'Geometri',
    pertanyaan: "Jumlah seluruh sudut pada sebuah segiempat adalah... derajat",
    jawabanBenar: "360",
    opsiLain: ["180", "540", "90"],
    pembahasan: "Setiap segiempat dapat dibagi menjadi 2 segitiga, sehingga $2 \\times 180 = 360$."
  },
  {
    id: 'sdk51',
    bidang: 'Logika',
    pertanyaan: "Jika satu jam sebelum jam 12.00 adalah jam 11.00, maka 100 menit sebelum jam 12.00 adalah jam...",
    jawabanBenar: "10.20",
    opsiLain: ["10.40", "11.10", "10.00"],
    pembahasan: "100 menit $= 1$ jam 40 menit. 12.00 dikurangi 1 jam $= 11.00$. 11.00 dikurangi 40 menit $= 10.20$."
  },
  {
    id: 'sdk52',
    bidang: 'Teori Bilangan',
    pertanyaan: "KPK dari 12 dan 15 adalah...",
    jawabanBenar: "60",
    opsiLain: ["30", "120", "180"],
    pembahasan: "$12 = 2^2 \\times 3, 15 = 3 \\times 5$. KPK $= 2^2 \\times 3 \\times 5 = 60$."
  }
],
      provinsi: [], nasional: []
    },
    smp: { kabupaten: [], provinsi: [], nasional: [] }
  },
  ipa: {
    sd: {
      kabupaten: [
        { id: 'ipasdk1', bidang: 'Biologi', pertanyaan: "Bagian sel tumbuhan yang berfungsi sebagai tempat terjadinya fotosintesis adalah...", jawabanBenar: "Kloroplas", opsiLain: ["Mitokondria", "Ribosom", "Vakuola"], pembahasan: "Kloroplas mengandung klorofil yang menangkap cahaya matahari untuk proses fotosintesis." },
      ],
      provinsi: [], nasional: []
    },
    smp: { kabupaten: [], provinsi: [], nasional: [] }
  },
  ips: {
    smp: {
      kabupaten: [
        { id: 'ipssmpk1', bidang: 'Geografi', pertanyaan: "Negara di Asia Tenggara yang tidak memiliki garis pantai adalah...", jawabanBenar: "Laos", opsiLain: ["Vietnam", "Kamboja", "Thailand"], pembahasan: "Laos adalah satu-satunya negara di Asia Tenggara yang wilayahnya dikelilingi daratan (landlocked)." },
      ],
      provinsi: [], nasional: []
    }
  }
};

const fillTo25 = (pool, subject, grade, level) => {
  if (pool.length >= 25) return pool;
  const needed = 25 - pool.length;
  const mockData = [];
  for (let i = 0; i < needed; i++) {
    mockData.push({
      id: `mock-${subject}-${grade}-${level}-${i}`,
      bidang: 'Simulasi',
      pertanyaan: `[Soal Simulasi ${subject.toUpperCase()} ${i+1}] Berapa hasil dari $15 \\times 3 + 5$ ?`,
      jawabanBenar: "50",
      opsiLain: ["45", "55", "60"],
      pembahasan: "$45 + 5 = 50$."
    });
  }
  return [...pool, ...mockData];
};

const MathText = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\$.*?\$)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          let content = part.slice(1, -1);
          content = content.replace(/\\sqrt/g, '√').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\implies/g, '→').replace(/\\dots/g, '...');
          return <span key={i} className="font-serif italic mx-0.5 text-indigo-400 font-bold">{content}</span>;
        }
        return part;
      })}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [subject, setSubject] = useState('matematika');
  const [grade, setGrade] = useState(null);
  const [level, setLevel] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const explanationRef = useRef(null);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('math_olympiad_v3_stats');
    return saved ? JSON.parse(saved) : { totalPoin: 0, totalSesi: 0, history: [] };
  });

  useEffect(() => {
    localStorage.setItem('math_olympiad_v3_stats', JSON.stringify(stats));
  }, [stats]);

  // Auto-scroll ke pembahasan
  useEffect(() => {
    if (showExplanation && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showExplanation]);

  const RANKS = [
    { id: 1, title: "Perunggu", min: 0, color: "text-orange-500", bg: "bg-orange-100", border: "border-orange-200", icon: <Award size={32} /> },
    { id: 2, title: "Perak", min: 1000, color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", icon: <ShieldCheck size={32} /> },
    { id: 3, title: "Emas", min: 3000, color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200", icon: <Trophy size={32} /> },
    { id: 4, title: "Diamond", min: 7000, color: "text-cyan-400", bg: "bg-cyan-100", border: "border-cyan-200", icon: <Gem size={32} /> },
    { id: 5, title: "Legend", min: 15000, color: "text-rose-500", bg: "bg-rose-100", border: "border-rose-200", icon: <Flame size={32} /> },
    { id: 6, title: "Mythic", min: 30000, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200", icon: <Crown size={32} /> },
  ];

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(r => stats.totalPoin >= r.min) || RANKS[0];
  }, [stats.totalPoin]);

  const nextRank = useMemo(() => RANKS.find(r => r.min > stats.totalPoin), [stats.totalPoin]);

  const startQuiz = (g, l) => {
    const pool = SOAL_DATABASE[subject]?.[g]?.[l] || [];
    const fullPool = fillTo25(pool, subject, g, l);
    const shuffled = [...fullPool].sort(() => Math.random() - 0.5).slice(0, 25);
    
    setQuestions(shuffled);
    setGrade(g);
    setLevel(l);
    setQuizActive(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswer = (ans) => {
    if (selectedAnswer) return;
    setSelectedAnswer(ans);
    if (ans === questions[currentIndex].jawabanBenar) {
      setScore(s => s + 4);
    }
    setTimeout(() => setShowExplanation(true), 400);
  };

  const finishQuiz = () => {
    setStats(prev => ({
      totalPoin: prev.totalPoin + score,
      totalSesi: prev.totalSesi + 1,
      history: [{ date: new Date().toLocaleDateString(), score, grade, level, subject }, ...prev.history].slice(0, 10)
    }));
    setShowResult(true);
  };

  const renderBeranda = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">OLYMPIA<span className="text-indigo-600">PRO</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Subject Simulator</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100"><BrainCircuit className="text-indigo-600" /></div>
      </div>

      <div className="space-y-8">
        {/* Pilih Mapel */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Mata Pelajaran</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'matematika', label: 'MTK', icon: <Calculator size={20}/> },
              { id: 'ipa', label: 'IPA', icon: <Microscope size={20}/> },
              { id: 'ips', label: 'IPS', icon: <Globe2 size={20}/> }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => { setSubject(m.id); setGrade(null); }}
                className={`p-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all ${subject === m.id ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg' : 'bg-white border-transparent text-slate-400 shadow-sm'}`}
              >
                {m.icon}
                <span className="text-[10px] font-black">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Pilih Jenjang */}
        <section className="animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Jenjang</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['sd', 'smp'].map(g => (
              <button 
                key={g}
                onClick={() => setGrade(g)}
                className={`p-6 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all border-4 ${grade === g ? 'bg-indigo-600 border-indigo-200 text-white shadow-xl scale-105' : 'bg-white border-white shadow-sm text-slate-400 hover:border-indigo-100'}`}
              >
                <LayoutGrid size={32} />
                <span className="font-black uppercase">{g}</span>
              </button>
            ))}
          </div>
        </section>

        {grade && (
          <section className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-4">
              <Target className="text-slate-400" size={18} />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tingkat</h2>
            </div>
            <div className="space-y-3">
              {['kabupaten', 'provinsi', 'nasional'].map((l) => (
                <button 
                  key={l}
                  onClick={() => startQuiz(grade, l)}
                  className="w-full flex items-center justify-between p-6 bg-white border-2 border-white shadow-sm rounded-[2rem] hover:border-indigo-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600">
                       {l === 'kabupaten' ? <Pi size={20} /> : l === 'provinsi' ? <FunctionSquare size={20} /> : <Trophy size={20} />}
                    </div>
                    <span className="font-black text-slate-700 capitalize">{l}</span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderStatistik = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <h2 className="text-2xl font-black text-slate-800 mb-6 italic text-center">Progres Belajar</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl">
          <p className="text-[10px] font-black opacity-60 uppercase mb-1">Total Poin</p>
          <div className="text-3xl font-black">{stats.totalPoin} XP</div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sesi Selesai</p>
          <div className="text-3xl font-black text-slate-800">{stats.totalSesi}</div>
        </div>
      </div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Riwayat Terakhir</h3>
      <div className="space-y-3">
        {stats.history.map((h, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex justify-between items-center">
            <div>
              <p className="font-black text-slate-700 uppercase text-[10px]">{h.subject} • {h.grade} • {h.level}</p>
              <p className="text-[9px] text-slate-400 font-medium">{h.date}</p>
            </div>
            <span className="text-lg font-black text-indigo-600">+{h.score}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPeringkat = () => (
    <div className="max-w-md mx-auto pt-10 pb-32 px-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-slate-800 mb-2 italic">Daftar Peringkat</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kumpulkan XP dari semua mapel</p>
      </div>
      
      <div className={`w-full p-8 rounded-[3.5rem] ${currentRank.bg} border-4 ${currentRank.border} mb-12 flex flex-col items-center shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">{React.cloneElement(currentRank.icon, { size: 120 })}</div>
        <div className={`${currentRank.color} mb-4 p-4 bg-white rounded-full shadow-sm`}>{React.cloneElement(currentRank.icon, { size: 48 })}</div>
        <h3 className={`text-3xl font-black ${currentRank.color}`}>{currentRank.title}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase mt-1">Status Kamu Saat Ini</p>
        <div className="w-full mt-8">
           <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
              <span>Progres</span>
              <span>{stats.totalPoin} XP</span>
           </div>
           <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: nextRank ? `${(stats.totalPoin / nextRank.min) * 100}%` : '100%' }} />
           </div>
        </div>
      </div>

      <div className="space-y-3">
        {RANKS.map((r) => {
          const isUnlocked = stats.totalPoin >= r.min;
          return (
            <div key={r.id} className={`p-4 rounded-[2rem] flex items-center justify-between border-2 transition-all ${isUnlocked ? 'bg-white border-indigo-50 shadow-sm' : 'bg-slate-50 border-transparent grayscale opacity-40'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.bg} ${r.color}`}>{r.icon}</div>
                <div>
                   <p className="font-black text-slate-700 text-sm">{r.title}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">{r.min} XP</p>
                </div>
              </div>
              {isUnlocked && <CheckCircle2 className="text-indigo-600" size={16} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (quizActive) {
    return (
      <div className="min-h-screen bg-white fixed inset-0 z-[100] flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-50 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <button onClick={() => setQuizActive(false)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px]"><Home size={18} /> Beranda</button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{subject} • {grade} • {level}</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-4 h-1 rounded-full ${i < Math.floor(currentIndex/5) ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>
          <div className="text-indigo-600 font-black tracking-tighter">Skor: {score}</div>
        </div>

        {!showResult ? (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soal {currentIndex + 1} / 25</span>
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase">{questions[currentIndex]?.bidang}</span>
              </div>

              <div className="bg-indigo-900 p-10 rounded-[3.5rem] text-white shadow-2xl mb-8 text-center relative overflow-hidden">
                <div className="relative z-10 text-xl font-medium leading-relaxed"><MathText text={questions[currentIndex]?.pertanyaan} /></div>
              </div>

              <div className="space-y-3">
                {[questions[currentIndex]?.jawabanBenar, ...questions[currentIndex]?.opsiLain].sort().map((opsi, idx) => {
                  const isSelected = selectedAnswer === opsi;
                  const isCorrect = opsi === questions[currentIndex]?.jawabanBenar;
                  let style = "bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100";
                  if (selectedAnswer) {
                    if (isCorrect) style = "bg-emerald-500 border-emerald-300 text-white shadow-lg scale-[1.02]";
                    else if (isSelected) style = "bg-rose-500 border-rose-300 text-white opacity-60";
                    else style = "bg-slate-50 text-slate-300 opacity-40";
                  }
                  return (
                    <button key={idx} disabled={!!selectedAnswer} onClick={() => handleAnswer(opsi)} className={`w-full p-6 rounded-[2.2rem] text-left font-bold border-2 transition-all flex items-center justify-between ${style}`}>
                      <MathText text={opsi} />
                      {selectedAnswer && isCorrect && <CheckCircle2 size={20} />}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div ref={explanationRef} className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
                  <div className="bg-indigo-50 p-8 rounded-[3rem] border-2 border-indigo-100 mb-6">
                    <div className="flex items-center gap-2 mb-3"><Key size={16} className="text-indigo-600" /><h3 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest">Pembahasan</h3></div>
                    <div className="text-indigo-800/80 text-sm font-medium leading-relaxed"><MathText text={questions[currentIndex]?.pembahasan} /></div>
                  </div>
                  <button onClick={() => currentIndex < questions.length - 1 ? (setCurrentIndex(currentIndex + 1), setSelectedAnswer(null), setShowExplanation(false)) : finishQuiz()} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95">
                    {currentIndex < questions.length - 1 ? 'LANJUT SOAL BERIKUTNYA' : 'LIHAT HASIL AKHIR'} <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-12">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className={`w-32 h-32 ${currentRank.bg} rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl ${currentRank.color}`}>{React.cloneElement(currentRank.icon, { size: 64 })}</div>
              <h2 className="text-4xl font-black text-slate-800 mb-2 italic">Luar Biasa!</h2>
              <div className="bg-slate-50 w-full p-10 rounded-[3.5rem] mb-8 text-center border-2 border-white shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Skor Sesi Ini</span>
                  <div className="text-8xl font-black text-indigo-600 leading-none">{score}</div>
                  <p className="mt-6 text-xs font-bold text-emerald-500 uppercase flex items-center justify-center gap-2"><Flame size={14} /> +{score} XP Berhasil Diraih</p>
              </div>
              <div className="w-full space-y-3 mb-10">
                <button onClick={() => startQuiz(grade, level)} className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95"><RefreshCcw size={20} /> ULANGI LAGI</button>
                <button onClick={() => setQuizActive(false)} className="w-full py-6 bg-white text-slate-400 rounded-[2.5rem] font-black border-2 border-slate-100">KEMBALI KE MENU</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="pb-32">{activeTab === 'beranda' && renderBeranda()} {activeTab === 'statistik' && renderStatistik()} {activeTab === 'peringkat' && renderPeringkat()}</div>
      <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6">
        <nav className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2.8rem] p-2 flex items-center justify-between w-full max-w-sm">
          {['beranda', 'statistik', 'peringkat'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[2.2rem] transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              {tab === 'beranda' ? <Home size={20}/> : tab === 'statistik' ? <BarChart3 size={20}/> : <Award size={20}/>}
              <span className="text-[9px] font-black uppercase">{tab}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
