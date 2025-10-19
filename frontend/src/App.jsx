import { Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { authUser, isLoading, login } = useAuthStore();

  console.log("auth user:", authUser);
  console.log("is loading:", isLoading);

  return (
    <div className='relative h-screen w-screen bg-neutral-950 flex items-center justify-center overflow-hidden'>
      {/* Background decorators */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-blue-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      {/* Content */}
      <div className='relative z-10 p-4'>
        <Routes>
          <Route path='/' element={<ChatPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
