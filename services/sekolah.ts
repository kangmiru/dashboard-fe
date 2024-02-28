import http from "./http";

interface Result {
  name: string;
  value: number;
}

interface SchoolCategory {
  id: number;
  name: string;
  abbreviation: string;
}

const getAllSekolah = async () => {
  return (await http.get("api/instansi/sekolah")).data.results;
};

const getSekolah = async (id: number) => {
  return (await http.get(`api/instansi/sekolah/${id}`)).data;
};

const getAllUnlinkedSekolah = async () => {
  return (await http.get("api/instansi/sekolah/unlinked")).data;
};

const addSekolah = async (data: FormData) => {
  await http.post("api/instansi/sekolah/", data);
};

const deleteSekolah = async (id: number) => {
  await http.delete(`api/instansi/sekolah/${id}`);
};

const updateSekolah = async (id: number, data: FormData) => {
  await http.put(`api/instansi/sekolah/${id}`, data);
};

const getKategoriSekolah = async () => {
  const response = await http.get("api/instansi/sekolah/kategori");
  const results = response.data.results;
  let list_kategori: Result[] = [];
  results.forEach((category: SchoolCategory) => {
    list_kategori.push({
      name: category.name + ` (${category.abbreviation.toUpperCase()})`,
      value: category.id,
    });
  });
  return list_kategori;
};

const getKategoriById = async (id: number) => {
  return (await http.get(`api/instansi/sekolah/kategori/${id}`)).data;
};

const countSekolah = async () => {
  return (await http.get("api/instansi/sekolah?count=true")).data.count;
};

export {
  getAllSekolah,
  getSekolah,
  addSekolah,
  deleteSekolah,
  updateSekolah,
  getKategoriSekolah,
  getKategoriById,
  getAllUnlinkedSekolah,
  countSekolah,
};
