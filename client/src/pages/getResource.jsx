import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Branch mapping
const BRANCH_CODES = {
  "03": "Computer Engineering",
  // Add other branch codes as needed
};

// Calculate semester based on admission year
const calculateSemester = (admissionYear) => {
  const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year
  const yearDiff = currentYear - admissionYear;
  const semester = (yearDiff * 2); // Each year has 2 semesters
  
  // Return valid semester (2,4,6) or default to earliest available
  if (semester === 2 || semester === 4 || semester === 6) {
    return semester.toString();
  }
  return "2"; // Default to earliest semester if calculation is invalid
};

// Process MIS number to extract information
const processMIS = (mis) => {
  if (!mis || mis.length !== 9) return null;
  
  const misString = mis.toString();
  const year = parseInt(misString.substring(2, 4)); // First 2 digits
  const branchCode = misString.substring(4, 6); // Next 2 digits
  console.log('Year:', year);
  console.log('Branch Code:', branchCode);
  
  return {
    branch: BRANCH_CODES[branchCode] || "",
    semester: calculateSemester(year)
  };
};

// Extract playlist ID from YouTube URL
const extractPlaylistId = (url) => {
  const regex = /list=([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const branches = [
  "Computer Engineering",
];
const semesters = ["2", "4", "6"];

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 w-full max-w-md">
      <div className="h-12 w-full bg-gray-700 rounded-lg" />
      <div className="h-12 w-full bg-gray-700 rounded-lg" />
      <div className="h-12 w-full bg-gray-700 rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-700 rounded" />
        <div className="h-4 w-5/6 bg-gray-700 rounded" />
        <div className="h-4 w-4/6 bg-gray-700 rounded" />
      </div>
    </div>
  )
}

function ResourceList({ selectedSubject, filteredResources }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl bg-gray-800 border-gray-700 rounded-2xl shadow-xl border"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold text-blue-400">
          Resources for {selectedSubject}
        </h2>
      </div>
      <div className="p-6">
        <div className="h-[600px] overflow-y-auto pr-4">
          <ul className="space-y-6">
            {filteredResources.map((chapter) => (
              <motion.li
                key={chapter._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-700 rounded-xl p-6"
              >
                <h3 className="font-semibold text-xl mb-4 text-gray-100">
                  {chapter.name}
                </h3>
                <ul className="space-y-3">
                  {chapter.resources.length > 0 ? (
                    chapter.resources.map((res, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center"
                      >
                        <span className="w-3 h-3 bg-blue-400 rounded-full mr-3"></span>
                        {res.type === "youtube" ? (
                          <a
                            href={`/yt/${encodeURIComponent(
                              extractPlaylistId(res.link) || ""
                            )}?from=${res.from}&to=${res.to}`}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline text-lg"
                          >
                            {res.type} - {res.linkName || res.link}
                          </a>
                        ) : (
                          <a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline text-lg"
                          >
                            {res.type} - {res.linkName || res.link}
                          </a>
                        )}
                      </motion.li>
                    ))
                  ) : (
                    <p className="text-gray-400 text-lg">
                      No resources available for this chapter.
                    </p>
                  )}
                </ul>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}


const FetchResourcesPage = () => {
  const [formData, setFormData] = useState({ branch: "", semester: "" })
  const [resources, setResources] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchResources = async (branch, semester) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/resources?branch=${branch}&semester=${semester}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
      
      const data = await response.json()
      setResources(data || [])
      const subjects = data.map((resource) => resource.subject.name)
      setSubjects([...new Set(subjects)])
    } catch (err) {
      setError("An error occurred while fetching resources.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    // Try to get and process token on component mount
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const mis = decodedToken.mis;
        
        const misInfo = processMIS(mis);
        if (misInfo && misInfo.branch && misInfo.semester) {
          // Set form data
          setFormData({
            branch: misInfo.branch,
            semester: misInfo.semester
          });
          
          // Immediately fetch resources
          fetchResources(misInfo.branch, misInfo.semester);
        }
      }
    } catch (err) {
      console.error('Error processing token:', err);
    }
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { branch, semester } = formData
    fetchResources(branch, semester)
  }

  const filteredResources = resources.filter(
    (resource) => resource.subject.name === selectedSubject
  )

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-8 transition-colors bg-gradient-to-b from-[#001233] to-[#001845]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-gray-800 border-gray-700 rounded-2xl shadow-xl border mb-8"
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-blue-400">
            Study Resources
          </h1>
          <p className="mt-2 text-gray-400">
            Select your branch and semester to explore resources
          </p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Branch
              </label>
              <select
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none
                  bg-gray-700 border-gray-600 text-gray-100 cursor-not-allowed"
                onChange={(e) => handleInputChange("branch", e.target.value)}
                value={formData.branch}
                disabled
              >
                <option value="" className="text-gray-400 cursor-not-allowed">
                  Select a Branch
                </option>
                {branches.map((branch) => (
                  <option key={branch} value={branch} className="text-gray-100">
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Semester
              </label>
              <select
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none
                  bg-gray-700 border-gray-600 text-gray-100 cursor-not-allowed"
                onChange={(e) => handleInputChange("semester", e.target.value)}
                value={formData.semester}
                disabled

              >
                <option value="" className="text-gray-400">
                  Select a Semester
                </option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem} className="text-gray-100">
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors font-medium"
            >
              {loading ? "Fetching..." : "Fetch Resources"}
            </motion.button>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 w-full max-w-md bg-red-900/20 border border-red-900/30 text-red-400 rounded-xl p-4"
          >
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="mt-6">
          <LoadingSkeleton />
        </div>
      )}

      <AnimatePresence>
        {resources.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mt-6 w-full max-w-md bg-gray-800 border-gray-700 rounded-2xl shadow-xl border"
          >
            <div className="p-6">
              <select
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none
                  bg-gray-700 border-gray-600 text-gray-100"
                onChange={(e) => setSelectedSubject(e.target.value)}
                value={selectedSubject}
              >
                <option value="" className="text-gray-400">
                  Select a Subject
                </option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject} className="text-gray-100">
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedSubject && filteredResources.length > 0 && (
          <div className="mt-6">
            <ResourceList
              selectedSubject={selectedSubject}
              filteredResources={filteredResources}
            />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resources.length === 0 && !loading && !error && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6 font-medium text-gray-400"
          >
            No resources found.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FetchResourcesPage