# HRIS — Requirement Analysis (Phase 1)

## 1. Actor / Role

| Actor | Deskripsi |
|---|---|
| **Employee** | Pengguna dasar, mengelola data pribadi & pengajuan diri sendiri |
| **Manager** | Employee yang punya bawahan, bisa approve/reject pengajuan tim |
| **HR** | Mengelola seluruh data master (employee, department, position, payroll) |

---

## 2. Functional Requirement (FR)

### Module: Authentication & Authorization

| ID | Requirement |
|---|---|
| FR-001 | Sistem harus memungkinkan user login menggunakan email dan password |
| FR-002 | Sistem harus menghasilkan access token (JWT) dan refresh token saat login berhasil |
| FR-003 | Sistem harus menolak akses ke endpoint tertentu jika role user tidak sesuai (RBAC) |
| FR-004 | Sistem harus memungkinkan user logout dan invalidasi refresh token |
| FR-005 | Sistem harus memungkinkan user reset password melalui email |

### Module: Employee Management

| ID | Requirement |
|---|---|
| FR-006 | HR dapat membuat data employee baru (nama, email, department, position, tanggal masuk) |
| FR-007 | HR dapat mengubah dan menonaktifkan (bukan menghapus permanen) data employee |
| FR-008 | Employee dapat melihat dan mengubah data profil terbatas (no. telepon, alamat) |
| FR-009 | HR dapat membuat, mengubah, menghapus data department dan position |
| FR-010 | Manager dapat melihat daftar anggota tim yang berada di bawahnya |

### Module: Attendance

| ID | Requirement |
|---|---|
| FR-011 | Employee dapat melakukan clock-in dan clock-out satu kali per hari |
| FR-012 | Sistem harus mencatat timestamp dan (opsional) lokasi saat clock-in/out |
| FR-013 | Employee dapat melihat riwayat kehadirannya sendiri |
| FR-014 | HR/Manager dapat melihat rekap kehadiran seluruh/anggota timnya |
| FR-015 | Sistem harus menandai status "Late" jika clock-in melewati jam kerja yang ditentukan |

### Module: Leave Management

| ID | Requirement |
|---|---|
| FR-016 | Employee dapat mengajukan cuti dengan memilih jenis cuti, tanggal mulai, dan tanggal selesai |
| FR-017 | Sistem harus menolak pengajuan jika saldo cuti tidak mencukupi |
| FR-018 | Sistem harus menolak pengajuan jika tanggal overlap dengan cuti lain yang masih pending/approved |
| FR-019 | Manager dapat melihat daftar pengajuan cuti dari anggota timnya dan melakukan approve/reject |
| FR-020 | Sistem harus mengurangi saldo cuti otomatis saat pengajuan disetujui |
| FR-021 | Employee dapat membatalkan pengajuan cuti selama masih berstatus pending |

### Module: Payroll

| ID | Requirement |
|---|---|
| FR-022 | Sistem harus menghitung gaji bulanan berdasarkan gaji pokok dikurangi potongan absensi/cuti tanpa saldo |
| FR-023 | HR dapat melihat dan men-generate slip gaji per employee per periode |
| FR-024 | Employee dapat melihat dan mengunduh slip gajinya sendiri |

### Module: Dashboard & Reporting

| ID | Requirement |
|---|---|
| FR-025 | Employee melihat dashboard ringkas: saldo cuti, status kehadiran bulan ini |
| FR-026 | Manager melihat dashboard ringkas: pengajuan cuti pending timnya |
| FR-027 | HR melihat dashboard ringkas: total employee aktif, rekap kehadiran & cuti perusahaan |

---

## 3. Non-Functional Requirement (NFR)

| ID | Kategori | Requirement |
|---|---|---|
| NFR-001 | Security | Password harus di-hash (bcrypt/argon2), tidak boleh disimpan plain text |
| NFR-002 | Security | Access token harus expired maksimal 15 menit, refresh token maksimal 7 hari |
| NFR-003 | Performance | Endpoint list data (employee, attendance) harus mendukung pagination |
| NFR-004 | Usability | UI harus responsive (desktop & tablet minimal) |
| NFR-005 | Reliability | Sistem harus mencatat log setiap perubahan data payroll (audit trail) |
| NFR-006 | Maintainability | Kode backend mengikuti struktur modular per domain (Employee, Attendance, dst) |
| NFR-007 | Scalability | Database harus di-index pada kolom yang sering di-query (employee_id, date) |

---

## 4. Use Case

### 4.1 Use Case Diagram (text representation)

```text
                         ┌───────────────────────────┐
                         │           HRIS             │
                         │                             │
   Employee ────────────▶│  Login                      │
        │                │  Clock In / Clock Out       │
        │                │  Ajukan Cuti                │
        │                │  Lihat Slip Gaji            │
        │                │  Lihat Profil                │
        │                │                             │
   Manager ─────────────▶│  (semua use case Employee)  │
        │                │  Approve/Reject Cuti Tim    │
        │                │  Lihat Rekap Tim            │
        │                │                             │
   HR ──────────────────▶│  Kelola Data Employee       │
                         │  Kelola Department/Position │
                         │  Generate Payroll            │
                         │  Lihat Laporan Perusahaan   │
                         └───────────────────────────┘
```

*Catatan: Manager mewarisi (inherit) seluruh use case Employee — dalam UML ini digambarkan sebagai relasi generalization.*

### 4.2 Use Case Description (contoh detail — yang paling kritikal)

**UC-01: Ajukan Cuti**

| Field | Detail |
|---|---|
| Actor | Employee |
| Precondition | Employee sudah login, memiliki saldo cuti > 0 |
| Main Flow | 1. Employee membuka halaman "Ajukan Cuti"<br>2. Employee memilih jenis cuti, tanggal mulai & selesai<br>3. Sistem validasi saldo cuti & overlap tanggal<br>4. Sistem menyimpan pengajuan dengan status `PENDING`<br>5. Sistem mengirim notifikasi ke Manager |
| Alternate Flow | 3a. Jika saldo tidak cukup → sistem tampilkan error, pengajuan ditolak<br>3b. Jika tanggal overlap → sistem tampilkan error |
| Postcondition | Pengajuan cuti tersimpan dengan status PENDING |

**UC-02: Approve/Reject Cuti**

| Field | Detail |
|---|---|
| Actor | Manager |
| Precondition | Ada pengajuan cuti berstatus PENDING dari anggota tim |
| Main Flow | 1. Manager membuka daftar pengajuan cuti tim<br>2. Manager memilih satu pengajuan<br>3. Manager approve atau reject<br>4. Sistem update status pengajuan<br>5. Jika approve → sistem mengurangi saldo cuti employee<br>6. Sistem mengirim notifikasi ke Employee |
| Postcondition | Status pengajuan menjadi APPROVED atau REJECTED |

**UC-03: Clock In / Clock Out**

| Field | Detail |
|---|---|
| Actor | Employee |
| Precondition | Employee sudah login, belum clock-in hari ini (untuk clock-in) |
| Main Flow | 1. Employee menekan tombol "Clock In"<br>2. Sistem mencatat timestamp<br>3. Sistem bandingkan dengan jam kerja standar → tandai status (Tepat waktu/Late) |
| Postcondition | Record attendance harian tersimpan |

---

## 5. User Story

### Employee

- **US-01:** Sebagai Employee, saya ingin login menggunakan email & password, agar saya bisa mengakses sistem dengan aman.
  *Acceptance Criteria:* Login gagal jika kredensial salah; berhasil mengarah ke dashboard sesuai role.

- **US-02:** Sebagai Employee, saya ingin melakukan clock-in dan clock-out, agar kehadiran saya tercatat otomatis.
  *Acceptance Criteria:* Tidak bisa clock-in dua kali dalam sehari; waktu tercatat sesuai timestamp server.

- **US-03:** Sebagai Employee, saya ingin mengajukan cuti dan melihat statusnya, agar saya tahu apakah cuti saya disetujui.
  *Acceptance Criteria:* Pengajuan gagal jika saldo cuti tidak cukup; status berubah real-time setelah di-approve/reject.

- **US-04:** Sebagai Employee, saya ingin melihat dan mengunduh slip gaji saya, agar saya punya bukti penghasilan bulanan.
  *Acceptance Criteria:* Slip gaji hanya bisa diakses oleh employee yang bersangkutan.

### Manager

- **US-05:** Sebagai Manager, saya ingin melihat daftar pengajuan cuti anggota tim saya, agar saya bisa mengelola ketersediaan tim.
  *Acceptance Criteria:* Hanya menampilkan pengajuan dari employee yang berada di bawah supervisi manager tersebut.

- **US-06:** Sebagai Manager, saya ingin approve atau reject pengajuan cuti, agar keputusan cuti tim terdokumentasi.
  *Acceptance Criteria:* Setelah approve, saldo cuti employee otomatis berkurang.

### HR

- **US-07:** Sebagai HR, saya ingin menambah dan mengubah data employee, agar data karyawan selalu up-to-date.
  *Acceptance Criteria:* Data yang dihapus tidak benar-benar hilang (soft delete/nonaktifkan).

- **US-08:** Sebagai HR, saya ingin men-generate payroll bulanan, agar proses penggajian tidak dilakukan manual.
  *Acceptance Criteria:* Perhitungan payroll otomatis memotong berdasarkan data attendance & cuti tanpa saldo.

- **US-09:** Sebagai HR, saya ingin melihat laporan rekap kehadiran & cuti seluruh perusahaan, agar saya punya data untuk evaluasi.
  *Acceptance Criteria:* Laporan bisa difilter berdasarkan periode & department.

---

**Next Step:** Phase 2 — System Design: Entity Relationship Diagram (ERD) dan System Architecture, diturunkan langsung dari FR & use case di atas.
