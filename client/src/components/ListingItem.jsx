import { Link } from 'react-router-dom';
import { MdLocationOn, MdStar, MdHouse, MdBathtub } from 'react-icons/md';
import { FaMoneyBillWave } from 'react-icons/fa';

export default function ListingItem({ listing }) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-shadow hover:shadow-2xl w-full sm:w-[350px] mx-auto">
      <Link to={`/listing/${listing._id}`} className="block">
        <img
          src={
            listing.imageUrls[0] ||
            'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg'
          }
          alt="Listing cover"
          className="h-[280px] sm:h-[220px] w-full object-cover transition-transform duration-300 transform hover:scale-105"
        />
        <div className="p-4 flex flex-col gap-4">
          <h3 className="text-2xl font-bold text-slate-800 hover:text-slate-600 transition-colors duration-200 truncate">
            {listing.name}
          </h3>
          <div className="flex items-center text-gray-600">
            <MdLocationOn className="h-5 w-5 text-green-600" />
            <span className="ml-2 text-sm truncate">{listing.address}</span>
          </div>
          {/* <div className="flex items-center text-slate-500">
            <MdStar className="h-5 w-5 text-yellow-500" />
            <span className="ml-1 text-sm">{listing.rating || 'N/A'}</span>
          </div> */}
          <p className="text-gray-500 line-clamp-3">
            {listing.description}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-slate-800 font-semibold flex items-center">
              <FaMoneyBillWave className="mr-1" />
              ${listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && ' / month'}
            </p>
            <span className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-1">
              {listing.type}
            </span>
          </div>
          <div className="flex gap-6 text-slate-700 text-xs">
            <div className="flex items-center">
              <MdHouse className="h-4 w-4" />
              <span className="font-bold ml-1">{listing.bedrooms} {listing.bedrooms > 1 ? 'beds' : 'bed'}</span>
            </div>
            <div className="flex items-center">
              <MdBathtub className="h-4 w-4" />
              <span className="font-bold ml-1">{listing.bathrooms} {listing.bathrooms > 1 ? 'baths' : 'bath'}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
