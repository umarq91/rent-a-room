import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 8) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value, checked } = e.target;
    
    if (id === 'type') {
      setSidebardata({ ...sidebardata, type: value });
    }
    
    if (id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: value });
    }

    if (['parking', 'furnished', 'offer'].includes(id)) {
      setSidebardata({ ...sidebardata, [id]: checked });
    }

    if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-0">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-gray-50 p-5 shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Search Term */}
          <div className="flex flex-col gap-2">
            <label htmlFor="searchTerm" className="font-semibold text-gray-700">
              Search Term:
            </label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Enter keyword..."
              className="border border-gray-300 rounded-lg p-3 w-full"
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Type:</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="all"
                  value="all"
                  className="w-5"
                  onChange={handleChange}
                  checked={sidebardata.type === 'all'}
                />
                <label htmlFor="all">Rent & Sale</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="rent"
                  value="rent"
                  className="w-5"
                  onChange={handleChange}
                  checked={sidebardata.type === 'rent'}
                />
                <label htmlFor="rent">Rent</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="sale"
                  value="sale"
                  className="w-5"
                  onChange={handleChange}
                  checked={sidebardata.type === 'sale'}
                />
                <label htmlFor="sale">Sale</label>
              </div>
            </div>
          </div>

          {/* Offer and Amenities */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Amenities:</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.parking}
              />
              <label htmlFor="parking">Parking</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.furnished}
              />
              <label htmlFor="furnished">Furnished</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={sidebardata.offer}
              />
              <label htmlFor="offer">Offer</label>
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">Sort By:</label>
            <select
              onChange={handleChange}
              id="sort_order"
              className="border border-gray-300 rounded-lg p-3"
              defaultValue="created_at_desc"
            >
              <option value="regularPrice_desc">Price: High to Low</option>
              <option value="regularPrice_asc">Price: Low to High</option>
              <option value="createdAt_desc">Newest Listings</option>
              <option value="createdAt_asc">Oldest Listings</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Listings Section */}
      <div className="flex-1 p-5">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6"></h1>
        <div className="flex flex-wrap gap-4">
          {loading ? (
            <p className="text-lg text-center w-full">Loading...</p>
          ) : listings.length === 0 ? (
            <p className="text-lg text-gray-600">No listings found!</p>
          ) : (
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))
          )}

          {/* Show More Button */}
          {showMore && !loading && (
            <button
              onClick={onShowMoreClick}
              className="w-full text-blue-600 hover:underline text-center py-4"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
   