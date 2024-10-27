import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Phone number validation logic
    if (id === 'phone') {
      const phoneNumber = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (!/^[1-9][0-9]{9}$/.test(phoneNumber)) {
        setPhoneError("Please enter a valid 10-digit phone number without the initial '0'");
      } else {
        setPhoneError(null);
      }

      setFormData({
        ...formData,
        [id]: phoneNumber,
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneError) return; // Prevent form submission if phone error exists

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <div className='bg-white rounded-lg shadow-lg p-10 max-w-sm w-full border border-gray-300'>
        <h1 className='text-3xl text-center font-semibold text-gray-800 mb-6'>
          Sign Up
        </h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <input
            type='text'
            placeholder='Username'
            className='border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-500 transition duration-200'
            id='username'
            onChange={handleChange}
            required
          />
          <input
            type='email'
            placeholder='Email'
            className='border-b-2 border-gray-300 p-2 focus:outline-none focus:border-blue-500 transition duration-200'
            id='email'
            onChange={handleChange}
            required
          />
          <div className='flex items-center border-b-2 border-gray-300 p-2 focus-within:border-blue-500 transition duration-200'>
            <span className='text-gray-500 pr-2'>+92</span>
            <input
              type='text'
              placeholder='Phone number'
              className='focus:outline-none flex-grow'
              id='phone'
              maxLength="10" // Restrict input to 10 digits
              onChange={handleChange}
              required
            />
          </div>
          {phoneError && <p className='text-red-500 text-sm'>{phoneError}</p>}
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
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          {/* Uncomment the line below to include OAuth */}
          {/* <OAuth /> */}
        </form>
        <div className='flex justify-between items-center mt-5'>
          <p className='text-gray-600'>Have an account?</p>
          <Link to={'/sign-in'}>
            <span className='text-blue-600 font-semibold hover:underline'>Sign in</span>
          </Link>
        </div>
        {error && <p className='text-red-500 mt-5 text-center'>{error}</p>}
      </div>
    </div>
  );
}
