import { useContext } from "react";
import { CallContext } from "../context/CallContext";

export default function useCall() {
  return useContext(CallContext);
}
