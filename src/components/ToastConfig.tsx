"use client";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastConfig = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="light"
      toastClassName="rounded-lg shadow-lg font-sans"
      className="text-sm font-medium p-3"
      progressClassName="bg-gradient-to-r from-blue-500 to-blue-600"
      style={{
        zIndex: 9999,
      }}
    />
  );
};

export default ToastConfig;