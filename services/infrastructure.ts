import http from "./http";

const getGedungSekolah = async (id: number) => {
  return (await http.get(`api/instansi/sekolah/${id}/gedung`)).data;
};

const getInventories = async (id: number) => {
  return (await http.get(`api/instansi/sekolah/${id}/inventaris`)).data;
};

export { getGedungSekolah, getInventories };
