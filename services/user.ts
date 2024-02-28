import http from "./http";

const deleteUser = async (id: number) => {
  await http.delete(`api/users/${id}`);
};

export { deleteUser };
