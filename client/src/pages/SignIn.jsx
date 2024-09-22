import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='bg-white rounded-lg shadow-lg p-10 max-w-sm w-full border border-gray-300'>
        <h1 className='text-3xl text-center font-semibold text-gray-800 mb-6'>
          Sign In
        </h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <input
            type='email'
            placeholder='Email'
            className='border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-500 transition duration-200'
            id='email'
            onChange={handleChange}
            required
          />
          <input
            type='password'
            placeholder='Password'
            className='border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-500 transition duration-200'
            id='password'
            onChange={handleChange}
            required
          />
          <button
            disabled={loading}
            className='bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50'
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          {/* <OAuth /> */}
        </form>
        <div className='flex justify-between items-center mt-5'>
          <p className='text-gray-600'>Don’t have an account?</p>
          <Link to={'/sign-up'}>
            <span className='text-blue-600 font-semibold hover:underline'>Sign up</span>
          </Link>
        </div>
        {error && <p className='text-red-500 mt-5 text-center'>{error}</p>}
      </div>
    </div>
  );
}
