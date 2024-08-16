import { useState } from "react";
import { toast } from "react-toastify";
import { auth, db } from "../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const LoginUser = async (e) => {
    e.preventDefault();
    try {
      // Attempt to sign in the user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed in:", user);

      const queryCollection = async (collectionName) => {
        const q = query(
          collection(db, collectionName),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          return querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))[0];
        } else {
          return null;
        }
      };
      toast.success("You signed in successfully");
      // Check in "admins" collection
      let userData = await queryCollection("admins");
      if (userData) {
        setTimeout(() => {
          navigate("/AdminLayout");
        }, 3000);
      }

      // Check in "employees" collection
      userData = await queryCollection("employees");
      if (userData) {
        setTimeout(() => {
          navigate("/EmployeeLayout");
        }, 3000);
      }

      // Check in "users" collection
      userData = await queryCollection("virtual-assistants");
      if (userData) {
        setTimeout(() => {
          navigate("/VirtualAssistantLayout");
        }, 3000);
      }

      // Navigate based on userType
    } catch (error) {
      // Handle errors here, such as invalid credentials
      console.error("Error signing in:", error.message);

      // Show an error toast message
      toast.error("Sign-in failed: " + error.message);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center w-screen bg-[#1332b9] h-screen ">
      <div className="flex flex-col items-center w-[50%] justify-center bg-white rounded-md shadow-lg gap-y-12 p-10">
        <h1 className="text-3xl font-bold text-black">Logo</h1>
        <div className="flex flex-col items-center justify-center w-full gap-y-8">
          <h1 className="text-2xl font-bold text-black">Login Form</h1>
          <div className="flex flex-col items-center justify-center w-full">
            <form
              className="w-[45%] flex flex-col items-center justify-center gap-y-6"
              onSubmit={LoginUser}
            >
              <input
                type="text"
                name="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-gray-300 rounded-md border-1 placeholder:text-gray-500"
                placeholder="Email"
              />
              <input
                type="password"
                name="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-gray-300 rounded-md border-1 placeholder:text-gray-500"
                placeholder="Password"
              />
              <div className="flex flex-col items-center justify-center w-full gap-y-5">
                <div className="flex flex-col items-end justify-end w-full">
                  <p className="text-black cursor-pointer ">Forgot Password?</p>
                  <input
                    type="submit" // Use type="submit" for the button
                    className="w-full p-4 text-white bg-blue-600 rounded-md shadow-lg cursor-pointer"
                    value={"Login"}
                  />
                </div>

                <div className="flex flex-col items-end justify-end w-full">
                  <p className="text-black cursor-pointer ">Not a member?</p>
                  <Link to={"/signUp"} className="w-full">
                    <button className="bg-[#043758] rounded-md text-white shadow-lg p-4 w-full">
                      SignUp
                    </button>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
