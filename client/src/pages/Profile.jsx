import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen flex items-center justify-center'>
      <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full'>
        <h1 className='text-3xl font-semibold text-center text-gray-800 mb-6'>
          Profile
        </h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
            ref={fileRef}
            hidden
            accept='image/*'
          />
          <div className='flex justify-center mb-4'>
            <img
              onClick={() => fileRef.current.click()}
              src={formData.avatar || currentUser.avatar}
              alt='profile'
              className='rounded-full h-32 w-32 object-cover cursor-pointer border-4 border-blue-600'
            />
          </div>
          <p className='text-sm text-center'>
            {fileUploadError ? (
              <span className='text-red-600'>Error uploading image (must be less than 2MB)</span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className='text-blue-600'>{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className='text-green-600'>Image successfully uploaded!</span>
            ) : (
              ''
            )}
          </p>
          <input
            type='text'
            placeholder='Username'
            defaultValue={currentUser.username}
            id='username'
            className='border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-600'
            onChange={handleChange}
          />
          <input
            type='email'
            placeholder='Email'
            id='email'
            defaultValue={currentUser.email}
            className='border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-600'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='Password'
            id='password'
            className='border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-600'
            onChange={handleChange}
          />
          <button
            disabled={loading}
            className='bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50'
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
          <Link
            className='bg-green-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-200'
            to={'/create-listing'}
          >
            Create Listing
          </Link>
        </form>
        <div className='flex justify-between mt-5'>
          <span
            onClick={handleDeleteUser}
            className='text-red-600 cursor-pointer hover:underline'
          >
            Delete Account
          </span>
          <span onClick={handleSignOut} className='text-red-600 cursor-pointer hover:underline'>
            Sign Out
          </span>
        </div>
        <p className='text-red-600 mt-5'>{error ? error : ''}</p>
        <p className='text-green-600 mt-5'>
          {updateSuccess ? 'User updated successfully!' : ''}
        </p>
        <button onClick={handleShowListings} className='bg-gray-300 text-gray-700 rounded-lg py-2 w-full hover:bg-gray-400 transition duration-200'>
          Show Listings
        </button>
        <p className='text-red-600 mt-5'>
          {showListingsError ? 'Error showing listings' : ''}
        </p>
        {userListings && userListings.length > 0 && (
          <div className='mt-5'>
            <h1 className='text-xl font-semibold text-center mb-4'>
              Your Listings
            </h1>
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className='border rounded-lg p-4 flex justify-between items-center mb-4 shadow-md'
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt='listing cover'
                    className='h-20 w-20 object-cover'
                  />
                </Link>
                <Link
                  className='text-gray-800 font-semibold hover:underline truncate flex-1 mx-3'
                  to={`/listing/${listing._id}`}
                >
                  <p>{listing.name}</p>
                </Link>
                <span
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-600 cursor-pointer hover:underline'
                >
                  Delete
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
