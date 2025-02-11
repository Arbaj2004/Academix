import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Pen } from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import { useDispatch } from 'react-redux';
import { updateProfilePic } from "../redux/userSlice";
import { parseMIS } from "../utils/MISParse";

const ProfileSection = ({ title, value, icon }) => (
  <motion.div
    className="bg-slate-800 p-3 sm:p-6 rounded-lg shadow-xl mb-3 w-full"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center space-x-2 sm:space-x-4">
      <div className="p-1.5 sm:p-3 bg-teal-500/10 rounded-full shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-teal-400 text-xs sm:text-sm font-medium">{title}</h3>
        <p className="text-slate-200 text-sm sm:text-lg font-semibold break-words">
          {value || "Not Available"}
        </p>
      </div>
    </div>
  </motion.div>
);

const AvatarWithUpload = ({ imageUrl, name, onUploadSuccess }) => {
  const [showUploader, setShowUploader] = useState(false);
  
  const handleUpload = (url) => {
    onUploadSuccess(url);
    setShowUploader(false);
  };

  return (
    <div className="relative w-28 h-28 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8">
      <motion.div
        className="relative w-full h-full rounded-full overflow-hidden group"
        whileHover={{ scale: 1.05 }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-teal-500/10 flex items-center justify-center">
            <span className="text-2xl sm:text-4xl text-teal-400">
              {name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}
        <motion.div
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 active:opacity-100 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setShowUploader(true)}
        >
          <Pen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          <p className="text-xs sm:text-base font-bold">Update Image</p>
        </motion.div>
      </motion.div>
      
      {showUploader && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 sm:block sm:relative sm:bg-transparent">
          <div className="w-full max-w-xs sm:absolute sm:z-10 sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:mt-4 sm:w-64 bg-slate-800 p-4 rounded-lg shadow-xl">
            <div title="Uploads Directly">
              <ImageUploader onUploadSuccess={handleUpload} />
            </div>
            <button 
              onClick={() => setShowUploader(false)}
              className="mt-2 w-full text-sm text-teal-400 hover:text-teal-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfessionalProfile = () => {
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    mis: "",
    branch: "",
    semester: "",
    profilePic: ""
  });

  const handleProfilePicUpdate = async (url) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/updateMe`,
        { profilePic: url },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.status === "success") {
        setUserData(prev => ({ ...prev, profilePic: url }));
        dispatch(updateProfilePic(url));
      }
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const URL = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users/me`;
        const token = localStorage.getItem('token');
        const response = await axios.get(URL, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { user } = response.data.data;
        const misInfo = parseMIS(user.mis).data;
        
        setUserData({
          name: user.name,
          email: user.email,
          mis: user.mis,
          branch: misInfo.branch,
          semester: misInfo.semester,
          profilePic: user.profilePic
        });
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 py-4 px-3 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-teal-400 mb-1 sm:mb-2">Student Profile</h1>
          <p className="text-xs sm:text-base text-slate-400">Your Academic Information Dashboard</p>
        </motion.div>

        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 p-4 sm:p-8 rounded-xl shadow-2xl"
          >
            <AvatarWithUpload
              imageUrl={userData.profilePic}
              name={userData.name}
              onUploadSuccess={handleProfilePicUpdate}
            />

            <div className="grid gap-4 sm:gap-6">
              <ProfileSection
                title="Full Name"
                value={userData.name}
                icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>}
              />
              <ProfileSection
                title="MIS Number"
                value={userData.mis}
                icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>}
              />
              <ProfileSection
                title="Email Address"
                value={userData.email}
                icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <ProfileSection
                  title="Branch"
                  value={userData.branch}
                  icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>}
                />
                <ProfileSection
                  title="Current Semester"
                  value={userData.semester}
                  icon={<svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-400 p-4"
          >
            Please log in to view your profile information.
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalProfile;