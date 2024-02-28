import http from "./http";

const getTransactionSummary = async (
  id: number,
  year: number | undefined = undefined,
  month: number | undefined = undefined
) => {
  if (year === undefined && month === undefined) {
    return (await http.get(`/api/instansi/sekolah/${id}/transaksi`)).data;
  } else if (month === undefined) {
    return (
      await http.get(`/api/instansi/sekolah/${id}/transaksi?year=${year}`)
    ).data;
  } else {
    return (
      await http.get(
        `/api/instansi/sekolah/${id}/transaksi?year=${year}&month=${month}`
      )
    ).data;
  }
};

const getTransactionHistory = async (
  id: number,
  page: number,
  year: number | undefined = undefined,
  month: number | undefined = undefined
) => {
  if (year === undefined && month === undefined) {
    return (
      await http.get(
        `/api/instansi/sekolah/${id}/transaksi/riwayat?page=${page}`
      )
    ).data;
  } else if (month === undefined) {
    return (
      await http.get(
        `/api/instansi/sekolah/${id}/transaksi/riwayat?page=${page}&year=${year}`
      )
    ).data;
  } else {
    return (
      await http.get(
        `/api/instansi/sekolah/${id}/transaksi/riwayat?page=${page}&year=${year}&month=${month}`
      )
    ).data;
  }
};

const getAvailableYearsMonths = async (id: number) => {
  return (
    await http.get(`/api/instansi/sekolah/${id}/transaksi/waktu-tersedia`)
  ).data;
};

export {
  getTransactionSummary,
  getAvailableYearsMonths,
  getTransactionHistory,
};
