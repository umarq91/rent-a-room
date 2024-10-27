import { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setUploading(false);
        })
        .catch(() => {
          setImageUploadError('Image upload failed (2 MB max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === 'sale' || id === 'rent') {
      setFormData({ ...formData, type: id });
    } else if (['parking', 'furnished', 'offer'].includes(id)) {
      setFormData({ ...formData, [id]: checked });
    } else {
      setFormData({ ...formData, [id]: type === 'number' ? Number(value) : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (formData.regularPrice < formData.discountPrice)
        return setError('Discount price must be lower than regular price');

      setLoading(true);
      setError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userRef: currentUser._id,phone:currentUser.phone }),
      });
      const data = await res.json();
      console.log(data);
      
      setLoading(false);
      if (!data) {
        setError(data.message);
      } else {
        navigate(`/listing/${data._id}`);
        window.location.reload();
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className='p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-md'>
      <h1 className='text-3xl font-bold text-center mb-8'>Create a Listing</h1>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='name' className='block mb-1 font-semibold'>Property Name</label>
            <input
              type='text'
              placeholder='Enter property name'
              className='border border-gray-300 p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              id='name'
              required
              onChange={handleChange}
              value={formData.name}
            />
          </div>
          <div>
            <label htmlFor='description' className='block mb-1 font-semibold'>Description</label>
            <textarea
              placeholder='Enter property description'
              className='border border-gray-300 p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              id='description'
              required
              onChange={handleChange}
              value={formData.description}
            />
          </div>
          <div>
            <label htmlFor='address' className='block mb-1 font-semibold'>Address</label>
            <input
              type='text'
              placeholder='Enter property address'
              className='border border-gray-300 p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              id='address'
              required
              onChange={handleChange}
              value={formData.address}
            />
          </div>
        </div>
        
        <div className='flex flex-wrap gap-4'>
          <label className='flex items-center'>
            <input
              type='radio'
              id='sale'
              className='mr-2'
              onChange={handleChange}
              checked={formData.type === 'sale'}
            />
            Sell
          </label>
          <label className='flex items-center'>
            <input
              type='radio'
              id='rent'
              className='mr-2'
              onChange={handleChange}
              checked={formData.type === 'rent'}
            />
            Rent
          </label>
          <label className='flex items-center'>
            <input
              type='checkbox'
              id='parking'
              className='mr-2'
              onChange={handleChange}
              checked={formData.parking}
            />
            Parking Spot
          </label>
          <label className='flex items-center'>
            <input
              type='checkbox'
              id='furnished'
              className='mr-2'
              onChange={handleChange}
              checked={formData.furnished}
            />
            Furnished
          </label>
          <label className='flex items-center'>
            <input
              type='checkbox'
              id='offer'
              className='mr-2'
              onChange={handleChange}
              checked={formData.offer}
            />
            Offer
          </label>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='bedrooms' className='block mb-1 font-semibold'>Bedrooms</label>
            <input
              type='number'
              id='bedrooms'
              min='1'
              required
              className='p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Number of bedrooms'
              onChange={handleChange}
              value={formData.bedrooms}
            />
          </div>
          <div>
            <label htmlFor='bathrooms' className='block mb-1 font-semibold'>Bathrooms</label>
            <input
              type='number'
              id='bathrooms'
              min='1'
              required
              className='p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Number of bathrooms'
              onChange={handleChange}
              value={formData.bathrooms}
            />
          </div>
          <div>
            <label htmlFor='regularPrice' className='block mb-1 font-semibold'>Regular Price</label>
            <input
              type='number'
              id='regularPrice'
              min='50'
              required
              className='p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter regular price'
              onChange={handleChange}
              value={formData.regularPrice}
            />
          </div>
          {formData.offer && (
            <div>
              <label htmlFor='discountPrice' className='block mb-1 font-semibold'>Discount Price</label>
              <input
                type='number'
                id='discountPrice'
                min='0'
                required
                className='p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter discount price'
                onChange={handleChange}
                value={formData.discountPrice}
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor='files' className='block mb-1 font-semibold'>Upload Images (max 6)</label>
          <input
            type='file'
            id='files'
            multiple
            className='border border-gray-300 p-4 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
            onChange={(e) => setFiles(e.target.files)}
          />
          <button
            type='button'
            onClick={handleImageSubmit}
            className='mt-2 w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Upload Images
          </button>
          {imageUploadError && <p className='text-red-600'>{imageUploadError}</p>}
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {formData.imageUrls.map((url, index) => (
            <div key={index} className='relative mt-4'>
              <img src={url} alt='Uploaded' className='h-40 w-full object-cover rounded-lg shadow' />
              <button
                onClick={() => handleRemoveImage(index)}
                className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
              >
                X
              </button>
            </div>
          ))}
        </div>
        {error && <p className='text-red-600'>{error}</p>}
        <button
          type='submit'
          disabled={loading}
          className='w-full p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-75'
        >
          {loading ? 'Creating Listing...' : 'Create Listing'}
        </button>
      </form>
    </main>
  );
}
