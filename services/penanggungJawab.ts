import http from "./http";

const getAllPenanggungJawab = async () => {
  return (await http.get("api/users/penanggung-jawab")).data.results;
};

const addPenanggungJawab = async (data: FormData) => {
  await http.post("api/users/penanggung-jawab", data);
};

const updatePenanggungJawab = async (id: number, data: FormData) => {
  await http.put(`api/users/penanggung-jawab/${id}`, data);
};

const countPenanggungJawab = async () => {
  return (await http.get("api/users/penanggung-jawab?count=true")).data.count;
};

const getInstansiPenanggungJawab = async () => {
  // get instansi penanngung depends on token
  return (await http.get("api/users/penanggung-jawab/instansi")).data;
};

export {
  getAllPenanggungJawab,
  updatePenanggungJawab,
  addPenanggungJawab,
  countPenanggungJawab,
  getInstansiPenanggungJawab,
};
