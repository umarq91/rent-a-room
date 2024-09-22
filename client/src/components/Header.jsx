import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [window.location.search]);

  return (
    <header className='bg-white shadow-lg sticky top-0 z-50'>
      <div className='flex justify-between items-center max-w-7xl mx-auto py-4 px-6'>
        {/* Logo */}
        <Link to='/' className='flex items-center'>
          <h1 className='font-bold text-3xl text-gray-800'>
            <span className='text-purple-600'>Rent</span>
            <span className='text-gray-600'>A</span>
            <span className='text-gray-900'>Room</span>
          </h1>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          className='flex items-center bg-gray-100 px-4 py-2 rounded-full shadow-md w-full max-w-md transition-all duration-300 ease-in-out transform hover:scale-105'
        >
          <input
            type='text'
            placeholder='Search for rooms, locations...'
            className='bg-transparent focus:outline-none text-sm w-full placeholder-gray-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type='submit' className='ml-3'>
            <FaSearch className='text-gray-500 hover:text-purple-600 transition-colors duration-200' />
          </button>
        </form>

        {/* Navigation and Profile */}
        <ul className='flex items-center space-x-6'>
          <Link to='/' className='text-gray-700 font-medium hover:text-purple-600 transition-colors'>
            Home
          </Link>
          <Link to='/about' className='text-gray-700 font-medium hover:text-purple-600 transition-colors'>
            About
          </Link>
          <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-10 w-10 object-cover border-2 border-purple-600 shadow-sm transition-transform duration-200 hover:scale-105'
                src={currentUser.avatar}
                alt='Profile'
              />
            ) : (
              <span className='text-gray-700 font-medium hover:text-purple-600 transition-colors'>
                Sign In
              </span>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
