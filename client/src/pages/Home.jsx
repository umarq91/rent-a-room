import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center h-[500px] p-10 text-center">
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
            Find Your  <span className="text-yellow-300">Perfect</span> Stay
          </h1>
          <p className="text-lg lg:text-2xl mb-4">
            Explore a wide range of room for rent and sale.
          </p>
          <Link
            to="/search"
            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-full font-semibold hover:bg-yellow-500 transition"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Featured Properties - Swiper */}
      <section className="max-w-7xl mx-auto my-10 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Featured Offers
        </h2>
        {offerListings && offerListings.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full"
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {offerListings.map((listing) => (
              <SwiperSlide key={listing._id}>
                <div
                  className="h-[400px] bg-cover bg-center rounded-xl shadow-lg"
                  style={{
                    backgroundImage: `url(${listing.imageUrls[0]})`,
                  }}
                >
                  <div className="h-full w-full bg-black bg-opacity-30 p-6 flex flex-col justify-end rounded-xl">
                    <h3 className="text-2xl text-white font-semibold">
                      {listing.title}
                    </h3>
                    <p className="text-white">{listing.location}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-500">No offers available</p>
        )}
      </section>

      {/* Property Listings Section */}
      <section className="max-w-7xl mx-auto my-12 px-4">
        {rentListings.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Recently Added Rentals
              </h3>
              <Link
                to="/search?type=rent"
                className="text-blue-600 hover:underline text-sm"
              >
                View all rentals
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {saleListings.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Recently Added Properties for Sale
              </h3>
              <Link
                to="/search?type=sale"
                className="text-blue-600 hover:underline text-sm"
              >
                View all sales
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
