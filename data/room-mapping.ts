export type RoomCategory = "public" | "diagnostic" | "emergency" | "support";

export interface RoomMappingRoom {
  id: string;
  name: string;
  category: RoomCategory;
  cluster: string;
  description: string;
  x: number;
  y: number;
  path: string;
  sourceLabel?: string;
}

export interface FloorPlanDefinition {
  id: string;
  name: string;
  shortLabel: string;
  image: string;
  width: number;
  height: number;
  source: string;
  notes: string;
  rooms: RoomMappingRoom[];
}

type RoomDefinition = Omit<RoomMappingRoom, "path">;

type Point = [number, number];

const room = (definition: RoomMappingRoom) => definition;

const boxPath = (left: number, top: number, right: number, bottom: number) =>
  `M${left},${top} L${right},${top} L${right},${bottom} L${left},${bottom} Z`;

const rectFromCenter = (centerX: number, centerY: number, width: number, height: number) => {
  const halfWidth = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);

  return boxPath(centerX - halfWidth, centerY - halfHeight, centerX + halfWidth, centerY + halfHeight);
};

const polygonPath = (points: Point[]) =>
  `${points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ")} Z`;

const rectRoom = (definition: RoomDefinition, width: number, height: number) =>
  room({
    ...definition,
    path: rectFromCenter(definition.x, definition.y, width, height),
  });

const polygonRoom = (definition: RoomDefinition, points: Point[]) =>
  room({
    ...definition,
    path: polygonPath(points),
  });

export const roomCategoryStyles: Record<
  RoomCategory,
  {
    label: string;
    color: string;
    softClass: string;
  }
> = {
  public: {
    label: "Publik",
    color: "#c26b2f",
    softClass: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  diagnostic: {
    label: "Radiologi",
    color: "#2563eb",
    softClass: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  emergency: {
    label: "IGD",
    color: "#dc2626",
    softClass: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  support: {
    label: "Penunjang",
    color: "#0f766e",
    softClass: "bg-teal-50 text-teal-700 ring-teal-200",
  },
};

const lantaiSatuRooms: RoomMappingRoom[] = [
  polygonRoom(
    {
      id: "lobby-bpjs",
      name: "Lobby BPJS",
      category: "public",
      cluster: "Administrasi & Komersial",
      description: "Zona tunggu dan antrean BPJS di sisi barat lantai 1.",
      x: 760,
      y: 1160,
      sourceLabel: "LOBBY BPJS",
    },
    [
      [350, 910],
      [1100, 910],
      [1100, 1420],
      [330, 1420],
    ]
  ),
  polygonRoom(
    {
      id: "area-commercial",
      name: "Area Commercial",
      category: "public",
      cluster: "Administrasi & Komersial",
      description: "Area komersial dan tenant di koridor depan barat.",
      x: 730,
      y: 1990,
      sourceLabel: "AREA COMMERCIAL",
    },
    [
      [330, 1780],
      [1020, 1780],
      [1020, 2240],
      [315, 2240],
    ]
  ),
  polygonRoom(
    {
      id: "lobby-utama",
      name: "Lobby Utama",
      category: "public",
      cluster: "Main Lobby",
      description: "Ruang penerima utama pengunjung di bagian depan gedung.",
      x: 1080,
      y: 2140,
      sourceLabel: "LOBBY UTAMA",
    },
    [
      [760, 1860],
      [1330, 1860],
      [1410, 2030],
      [1375, 2370],
      [1210, 2370],
      [1070, 2280],
      [900, 2370],
      [745, 2370],
      [710, 2035],
    ]
  ),
  polygonRoom(
    {
      id: "drop-off-main-lobby",
      name: "Drop Off Main Lobby",
      category: "public",
      cluster: "Main Lobby",
      description: "Area drop-off kendaraan untuk akses ke lobby utama.",
      x: 1110,
      y: 2460,
      sourceLabel: "DROP OFF MAIN LOBBY",
    },
    [
      [730, 2320],
      [1390, 2320],
      [1510, 2590],
      [610, 2590],
    ]
  ),
  polygonRoom(
    {
      id: "lounge",
      name: "Lounge",
      category: "public",
      cluster: "Main Lobby",
      description: "Area duduk santai yang terhubung langsung dengan lobby utama.",
      x: 1500,
      y: 2140,
      sourceLabel: "LOUNGE",
    },
    [
      [1300, 1950],
      [1710, 1950],
      [1755, 2360],
      [1260, 2360],
    ]
  ),
  rectRoom(
    {
      id: "corner-store",
      name: "Corner Store",
      category: "public",
      cluster: "Administrasi & Komersial",
      description: "Unit retail kecil di dekat inti lift servis.",
      x: 620,
      y: 1460,
      sourceLabel: "CORNER STORE",
    },
    220,
    140
  ),
  rectRoom(
    {
      id: "tenant-1",
      name: "Tenant 1",
      category: "public",
      cluster: "Administrasi & Komersial",
      description: "Unit tenant sisi kiri pada koridor komersial.",
      x: 820,
      y: 2060,
      sourceLabel: "TENANT",
    },
    150,
    190
  ),
  rectRoom(
    {
      id: "tenant-2",
      name: "Tenant 2",
      category: "public",
      cluster: "Administrasi & Komersial",
      description: "Unit tenant sisi kanan pada koridor komersial.",
      x: 960,
      y: 2060,
      sourceLabel: "TENANT",
    },
    150,
    190
  ),
  rectRoom(
    {
      id: "ct-scan",
      name: "CT Scan",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang CT Scan pada sayap radiologi barat.",
      x: 470,
      y: 640,
      sourceLabel: "CT SCAN",
    },
    300,
    560
  ),
  rectRoom(
    {
      id: "r-fswl",
      name: "R. FSWL",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang tindakan FSWL pada deret radiologi.",
      x: 675,
      y: 560,
      sourceLabel: "R. FSWL",
    },
    230,
    300
  ),
  rectRoom(
    {
      id: "r-usg",
      name: "R. USG",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang pemeriksaan USG bersebelahan dengan FSWL.",
      x: 865,
      y: 560,
      sourceLabel: "R. USG",
    },
    170,
    300
  ),
  rectRoom(
    {
      id: "r-persiapan",
      name: "R. Persiapan",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang persiapan pasien sebelum tindakan radiologi.",
      x: 1185,
      y: 705,
      sourceLabel: "R. PERSIAPAN",
    },
    210,
    190
  ),
  rectRoom(
    {
      id: "r-panoramic",
      name: "R. Panoramic",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang panoramic imaging pada sisi timur koridor radiologi.",
      x: 1145,
      y: 560,
      sourceLabel: "R. PANORAMIC",
    },
    145,
    145
  ),
  rectRoom(
    {
      id: "r-ganti-1",
      name: "R. Ganti 1",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang ganti pasien pertama untuk area imaging.",
      x: 1010,
      y: 860,
      sourceLabel: "R. GANTI",
    },
    120,
    100
  ),
  rectRoom(
    {
      id: "r-ganti-2",
      name: "R. Ganti 2",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang ganti pasien kedua untuk area imaging.",
      x: 1135,
      y: 860,
      sourceLabel: "R. GANTI",
    },
    120,
    100
  ),
  rectRoom(
    {
      id: "mri",
      name: "MRI",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang MRI utama di pusat cluster radiologi.",
      x: 1070,
      y: 960,
      sourceLabel: "MRI",
    },
    380,
    340
  ),
  rectRoom(
    {
      id: "x-ray",
      name: "X-Ray",
      category: "diagnostic",
      cluster: "Radiologi",
      description: "Ruang X-Ray pada sisi barat bawah area radiologi.",
      x: 525,
      y: 955,
      sourceLabel: "X-RAY",
    },
    320,
    300
  ),
  rectRoom(
    {
      id: "r-mesin-imaging",
      name: "R. Mesin Imaging",
      category: "support",
      cluster: "Radiologi",
      description: "Ruang mesin pendukung untuk MRI dan peralatan imaging.",
      x: 1245,
      y: 940,
      sourceLabel: "R. MESIN",
    },
    90,
    250
  ),
  rectRoom(
    {
      id: "lobby-lift-service",
      name: "Lobby Lift Service",
      category: "support",
      cluster: "Sirkulasi Vertikal",
      description: "Lobby untuk lift servis dan distribusi back-of-house.",
      x: 410,
      y: 1510,
      sourceLabel: "LOBBY LIFT SERVICE",
    },
    210,
    130
  ),
  rectRoom(
    {
      id: "r-panel",
      name: "R. Panel",
      category: "support",
      cluster: "Operasional",
      description: "Ruang panel utilitas di dekat inti servis barat.",
      x: 760,
      y: 1465,
      sourceLabel: "R. PANEL",
    },
    170,
    130
  ),
  rectRoom(
    {
      id: "r-hub",
      name: "R. Hub",
      category: "support",
      cluster: "Operasional",
      description: "Ruang hub jaringan dan komunikasi lantai 1.",
      x: 790,
      y: 1580,
      sourceLabel: "R. HUB",
    },
    150,
    100
  ),
  rectRoom(
    {
      id: "lobby-lift-passenger",
      name: "Lobby Lift Passenger",
      category: "support",
      cluster: "Sirkulasi Vertikal",
      description: "Lobby lift penumpang yang melayani area publik utama.",
      x: 940,
      y: 1490,
      sourceLabel: "LOBBY LIFT PASSENGER",
    },
    320,
    230
  ),
  rectRoom(
    {
      id: "lobby-lift-bed",
      name: "Lobby Lift Bed",
      category: "support",
      cluster: "Sirkulasi Vertikal",
      description: "Lobby lift bed untuk mobilisasi pasien dan alat medis.",
      x: 1290,
      y: 1470,
      sourceLabel: "LOBBY LIFT BED",
    },
    180,
    120
  ),
  rectRoom(
    {
      id: "r-kontrol",
      name: "R. Kontrol",
      category: "support",
      cluster: "Operasional",
      description: "Ruang kontrol operasional pada sisi komersial barat.",
      x: 300,
      y: 2010,
      sourceLabel: "R. KONTROL",
    },
    150,
    160
  ),
  rectRoom(
    {
      id: "r-dokter-praktek",
      name: "R. Dokter/Praktek",
      category: "emergency",
      cluster: "IGD",
      description: "Ruang konsultasi dokter pada sisi depan area IGD.",
      x: 1490,
      y: 1040,
      sourceLabel: "R. DOKTER / PRAKTEK",
    },
    175,
    140
  ),
  rectRoom(
    {
      id: "r-alat",
      name: "R. Alat",
      category: "emergency",
      cluster: "IGD",
      description: "Ruang penyimpanan alat untuk kebutuhan tindakan IGD.",
      x: 1490,
      y: 1170,
      sourceLabel: "R. ALAT",
    },
    160,
    120
  ),
  rectRoom(
    {
      id: "observasi-dewasa",
      name: "Observasi Dewasa",
      category: "emergency",
      cluster: "IGD",
      description: "Zona observasi dewasa di sisi timur IGD.",
      x: 1825,
      y: 1150,
      sourceLabel: "OBSERVASI DEWASA",
    },
    185,
    270
  ),
  rectRoom(
    {
      id: "observasi-anak",
      name: "Observasi Anak",
      category: "emergency",
      cluster: "IGD",
      description: "Zona observasi anak di bawah observasi dewasa.",
      x: 1825,
      y: 1345,
      sourceLabel: "OBSERVASI ANAK",
    },
    185,
    180
  ),
  rectRoom(
    {
      id: "r-stretcher",
      name: "R. Stretcher",
      category: "emergency",
      cluster: "IGD",
      description: "Ruang stretcher untuk staging troli pasien.",
      x: 1825,
      y: 1545,
      sourceLabel: "R. STRETCHER",
    },
    185,
    180
  ),
  rectRoom(
    {
      id: "resusitasi",
      name: "Resusitasi",
      category: "emergency",
      cluster: "IGD",
      description: "Ruang resusitasi untuk pasien kritis.",
      x: 1420,
      y: 1380,
      sourceLabel: "RESUSITASI",
    },
    170,
    130
  ),
  rectRoom(
    {
      id: "triase-1",
      name: "Triase 1",
      category: "emergency",
      cluster: "IGD",
      description: "Bilik triase pertama untuk screening awal.",
      x: 1585,
      y: 1380,
      sourceLabel: "TRIASE",
    },
    170,
    130
  ),
  rectRoom(
    {
      id: "triase-2",
      name: "Triase 2",
      category: "emergency",
      cluster: "IGD",
      description: "Bilik triase kedua untuk screening lanjutan.",
      x: 1585,
      y: 1560,
      sourceLabel: "TRIASE",
    },
    170,
    200
  ),
  rectRoom(
    {
      id: "triase-3",
      name: "Triase 3",
      category: "emergency",
      cluster: "IGD",
      description: "Bilik triase ketiga pada cluster gawat darurat.",
      x: 1435,
      y: 1560,
      sourceLabel: "TRIASE",
    },
    170,
    200
  ),
  rectRoom(
    {
      id: "r-obat",
      name: "R. Obat",
      category: "emergency",
      cluster: "IGD",
      description: "Ruang obat yang mendukung aktivitas tindakan dan observasi.",
      x: 1480,
      y: 1715,
      sourceLabel: "R. OBAT",
    },
    150,
    120
  ),
  rectRoom(
    {
      id: "spoelhoek",
      name: "Spoelhoek",
      category: "emergency",
      cluster: "IGD",
      description: "Area spoelhoek untuk utilitas kebersihan klinis.",
      x: 1395,
      y: 1710,
      sourceLabel: "SPOEL HOEK",
    },
    120,
    110
  ),
  rectRoom(
    {
      id: "nurse-station",
      name: "Nurse Station",
      category: "emergency",
      cluster: "IGD",
      description: "Pos perawat yang mengawasi sirkulasi utama IGD.",
      x: 1660,
      y: 1760,
      sourceLabel: "NURSE STATION",
    },
    170,
    90
  ),
  polygonRoom(
    {
      id: "teras-igd",
      name: "Teras IGD",
      category: "emergency",
      cluster: "IGD",
      description: "Teras akses IGD di depan ruang tindakan dan dekontaminasi.",
      x: 1820,
      y: 1765,
      sourceLabel: "TERAS IGD",
    },
    [
      [1735, 1675],
      [1905, 1675],
      [1905, 1860],
      [1735, 1860],
    ]
  ),
  rectRoom(
    {
      id: "r-tindakan",
      name: "R. Tindakan",
      category: "emergency",
      cluster: "IGD",
      description: "Ruang tindakan medis pada sisi selatan area IGD.",
      x: 1615,
      y: 1895,
      sourceLabel: "R. TINDAKAN",
    },
    180,
    130
  ),
  rectRoom(
    {
      id: "dekontaminasi",
      name: "Dekontaminasi",
      category: "emergency",
      cluster: "IGD",
      description: "Ruang dekontaminasi untuk penanganan awal pasien tertentu.",
      x: 1820,
      y: 1895,
      sourceLabel: "DEKONTAMINASI",
    },
    170,
    140
  ),
  polygonRoom(
    {
      id: "drop-igd",
      name: "Drop IGD",
      category: "emergency",
      cluster: "IGD",
      description: "Akses drop-off ambulans dan pasien untuk pintu masuk IGD.",
      x: 2060,
      y: 1580,
      sourceLabel: "DROP IGD",
    },
    [
      [1885, 920],
      [2145, 920],
      [2145, 2040],
      [1885, 2040],
    ]
  ),
  rectRoom(
    {
      id: "anteroom",
      name: "Anteroom",
      category: "emergency",
      cluster: "Isolasi",
      description: "Area transisi sebelum masuk ke ruang isolasi.",
      x: 1770,
      y: 2230,
      sourceLabel: "ANTEROOM",
    },
    145,
    110
  ),
  rectRoom(
    {
      id: "r-isolasi-1",
      name: "R. Isolasi 1",
      category: "emergency",
      cluster: "Isolasi",
      description: "Ruang isolasi pertama pada sisi tenggara lantai 1.",
      x: 1560,
      y: 2305,
      sourceLabel: "R. ISOLASI",
    },
    160,
    150
  ),
  rectRoom(
    {
      id: "r-isolasi-2",
      name: "R. Isolasi 2",
      category: "emergency",
      cluster: "Isolasi",
      description: "Ruang isolasi kedua di bawah ruang isolasi pertama.",
      x: 1560,
      y: 2455,
      sourceLabel: "R. ISOLASI",
    },
    160,
    150
  ),
];

export const floorPlans: Record<string, FloorPlanDefinition> = {
  "lantai-1": {
    id: "lantai-1",
    name: "Denah Lantai Satu",
    shortLabel: "LT.1",
    image: "/room-mapping/lantai-1-denah-crop-flat.png",
    width: 2230,
    height: 2600,
    source: "DENAH UPDATE R4.1 - 12-2-2026.pdf • Halaman LT.1",
    notes:
      "Ruangan lantai 1 dipetakan ulang sebagai SVG overlay langsung di atas hasil crop PDF, sehingga klik mengikuti area ruang dan bukan lagi marker titik.",
    rooms: lantaiSatuRooms,
  },
};
