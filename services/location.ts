import http from "./http";

interface Location {
  name: string;
  id: number;
}

const getProvinsi = async () => {
  const response = await http.get("api/wilayah/provinsi");
  return response.data.map((item: Location) => ({
    name: item.name,
    value: item.id,
  }));
};

const getKabupaten = async (province_id: number) => {
  const response = await http.get(`api/wilayah/provinsi/${province_id}`);
  return response.data.map((item: Location) => ({
    name: item.name,
    value: item.id,
  }));
};

const getKecamatan = async (city_regency_id: number) => {
  const response = await http.get(`api/wilayah/kabupaten/${city_regency_id}`);
  return response.data.map((item: Location) => ({
    name: item.name,
    value: item.id,
  }));
};

const getKelurahan = async (district_id: number) => {
  const response = await http.get(`api/wilayah/kecamatan/${district_id}`);
  return response.data.map((item: Location) => ({
    name: item.name,
    value: item.id,
  }));
};

export { getProvinsi, getKabupaten, getKecamatan, getKelurahan };
