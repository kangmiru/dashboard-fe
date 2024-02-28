import http from "./http";

const getAllYayasan = async () => {
  return (await http.get("api/instansi/yayasan")).data.results;
};

const getYayasan = async (id: number) => {
  return (await http.get(`api/instansi/yayasan/${id}`)).data;
};

const getSummarySekolah = async (id: number) => {
  return (await http.get(`api/instansi/yayasan/${id}/sekolah`)).data;
};

const getYayasanSekolahCategory = async (
  idYayasan: number,
  idCategory: number
) => {
  return (
    await http.get(`api/instansi/yayasan/${idYayasan}/sekolah/${idCategory}`)
  ).data;
};

const addYayasan = async (data: FormData) => {
  await http.post("api/instansi/yayasan/", data);
};

const updateYayasan = async (id: number, data: FormData) => {
  await http.put(`api/instansi/yayasan/${id}`, data);
};

const deleteYayasan = async (id: number) => {
  await http.delete(`api/instansi/yayasan/${id}`);
};

const linkToSekolah = async (id_yayasan: number, npsn: string) => {
  await http.post(`api/instansi/yayasan/${id_yayasan}/link/${npsn}`);
};

const countYayasan = async () => {
  return (await http.get("api/instansi/yayasan?count=true")).data.count;
};

export {
  getAllYayasan,
  getYayasan,
  getSummarySekolah,
  getYayasanSekolahCategory,
  addYayasan,
  updateYayasan,
  deleteYayasan,
  linkToSekolah,
  countYayasan,
};
