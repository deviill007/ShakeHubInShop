import "@/styles/globals.css";
import { ToastContainer, toast } from "react-toastify";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ToastContainer />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
