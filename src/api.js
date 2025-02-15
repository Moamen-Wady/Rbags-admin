import axios from "axios";

export default axios.create({
  withCredentials: true,
  baseURL: "https://rbags-back.vercel.app/",
  // baseURL: "http://localhost:3005",
});

export const isCancel = (err) => axios.isCancel(err);
