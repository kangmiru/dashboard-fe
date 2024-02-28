import http from "./http";

const getKehadiranHarian = async (id: number) => {
  return (await http.get(`api/instansi/sekolah/${id}/kehadiran/harian`)).data;
};

const getKehadiranBulanan = async (id: number) => {
  return (await http.get(`api/instansi/sekolah/${id}/kehadiran/bulanan`)).data;
};

const getKehadiranTahunan = async (id: number) => {
  return (await http.get(`api/instansi/sekolah/${id}/kehadiran/tahunan`)).data;
};

export { getKehadiranHarian, getKehadiranBulanan, getKehadiranTahunan };
