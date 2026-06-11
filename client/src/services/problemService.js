import api from "@/lib/api";

export const getProblems = async () => {
  const res = await api.get("/problems");
  return res.data;
};

export const getProblemById = async (id) => {
  const res = await api.get(`/problems/${id}`);
  return res.data;
};
