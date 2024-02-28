import http from "./http";

const getStatsPenanggungJawab = async () => {
  return (await http.get("api/users/penanggung-jawab/stats")).data;
};

const getStatsInstansi = async () => {
  return (await http.get("api/instansi/stats")).data;
};

export { getStatsPenanggungJawab, getStatsInstansi };
