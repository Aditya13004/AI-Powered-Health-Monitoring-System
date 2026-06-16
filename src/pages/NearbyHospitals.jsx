import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const staticHospitals = [
  {
    id: 'static-1',
    name: 'Global Hospital & Research Centre | Ravet, Pune',
    lat: 18.6463239,
    lon: 73.7569779,
    address: 'Sec No, 29 Plot, 1, Ravet High St, next to D-Mart, Sector 29, Ravet, Pimpri-Chinchwad, Maharashtra 412101',
    category: 'Multispeciality',
    image: '/images/Global Hospital & Research Centre Ravet, Pune.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15121.574541187816!2d73.7569779!3d18.6463239!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b921e987492f%3A0xf65eb64894a99edb!2sGlobal%20Hospital%20%26%20Research%20Centre%20%7C%20Ravet%2C%20Pune!5e0!3m2!1sen!2sin!4v1781632429261!5m2!1sen!2sin'
  },
  {
    id: 'static-2',
    name: 'Flora Multispeciality Hospital Ravet Pimpri Chinchwad',
    lat: 18.64662228247151,
    lon: 73.75226677497884,
    address: 'Ravet High St, near D-Mart, Shinde Vasti, Ravet, Pimpri-Chinchwad, Maharashtra 412101',
    category: 'Multispeciality',
    image: '/images/Flora Multispeciality Hospital Ravet Pimpri Chinchwad.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.386991988859!2d73.75226677497884!3d18.64662228247151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b959eef9640b%3A0x1504c214185fa512!2sFlora%20Multispeciality%20Hospital%20Ravet%20Pimpri%20Chinchwad!5e0!3m2!1sen!2sin!4v1781632454911!5m2!1sen!2sin'
  },
  {
    id: 'static-3',
    name: 'Ojas Multispeciality Hospital Ravet',
    lat: 18.643356482474214,
    lon: 73.75198277497873,
    address: 'Bhondve Chowk, S.R.No-203/1, DY Patil College Rd, Sector No. 32A, Sector 32 A, Ravet, Pimpri-Chinchwad, Maharashtra 412101',
    category: 'Multispeciality',
    image: '/images/Ojas Multispeciality Hospital Ravet.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.459697501626!2d73.75198277497873!3d18.643356482474214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b91cfc6540eb%3A0x432ea8d72fedf038!2sOjas%20Multispeciality%20Hospital%20Ravet!5e0!3m2!1sen!2sin!4v1781632489661!5m2!1sen!2sin'
  },
  {
    id: 'static-4',
    name: 'Lokmanya hospital Nigdi',
    lat: 18.6559512,
    lon: 73.7733794,
    address: 'Sector 27, Tilak Rd, Sector No. 24, Pradhikaran, Nigdi, Pune, Pimpri-Chinchwad, Maharashtra 411044',
    category: 'Hospital',
    image: '/images/Lokmanya hospital Nigdi.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.179237482052!2d73.7733794!3d18.6559512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b950fd6ed5a3%3A0x3fe995feaccbfbee!2sLokmanya%20hospital%20Nigdi!5e0!3m2!1sen!2sin!4v1781632561878!5m2!1sen!2sin'
  },
  {
    id: 'static-5',
    name: 'Care and Cure Multispecialty Hospital and Diagnostic Center',
    lat: 18.65009878246876,
    lon: 73.74877277497893,
    address: 'Pipeline Rd, Shinde Vasti, Ravet, Pune, Pimpri-Chinchwad, Maharashtra 412101',
    category: 'Multispeciality',
    image: '/images/Care and Cure Multispecialty Hospital and Diagnostic Center.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.309582229842!2d73.74877277497893!3d18.65009878246876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9167912ab1f%3A0x14b1b13d65e1e485!2sCare%20and%20Cure%20Multispecialty%20Hospital%20and%20Diagnostic%20Center!5e0!3m2!1sen!2sin!4v1781632621830!5m2!1sen!2sin'
  },
  {
    id: 'static-6',
    name: 'Prabhakar Malhar Kute Memorial Hospital',
    lat: 18.648940282469685,
    lon: 73.77949387497891,
    address: 'Shop No 9, Balaji Nagar, panchatara Nagar, Bijali Nagar, Ganga Nagar, Akurdi, Pimpri-Chinchwad, Maharashtra 411035',
    category: 'Hospital',
    image: '/images/Prabhakar Malhar Kute Memorial Hospital.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.3353796068545!2d73.77949387497891!3d18.648940282469685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9c54b415fcd%3A0x52590469c9dd6f5d!2sPrabhakar%20Malhar%20Kute%20Memorial%20Hospital!5e0!3m2!1sen!2sin!4v1781632677021!5m2!1sen!2sin'
  },
  {
    id: 'static-7',
    name: 'Dhanwantari Hospital Nigdi',
    lat: 18.655910382464075,
    lon: 73.76577917497913,
    address: 'Tilak Rd, Sector No. 27, Pradhikaran, Nigdi, Pune, Pimpri-Chinchwad, Maharashtra 411044',
    category: 'Hospital',
    image: '/images/Dhanwantari Hospital Nigdi.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.1801467047303!2d73.76577917497913!3d18.655910382464075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c05d56b1efb9%3A0x9cc59f3e318b0784!2sDhanwantari%20Hospital%20Nigdi!5e0!3m2!1sen!2sin!4v1781632730039!5m2!1sen!2sin'
  },
  {
    id: 'static-8',
    name: '24 Bliss Mother and Child Care Hospital',
    lat: 18.645226282472773,
    lon: 73.75445877497874,
    address: '24Bliss Mother and Child Care, Daya Villa, 102, DY Patil College Rd, next to Golden Bliss Apartment, Shinde Vasti, Ravet, Pimpri-Chinchwad, Maharashtra 412101',
    category: 'Clinic',
    image: '/images/24 Bliss Mother and Child Care Hospital.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.418072215499!2d73.75445877497874!3d18.645226282472773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b97567b5943f%3A0x394f4f26c2fc244d!2s24%20Bliss%20Mother%20and%20Child%20Care%20Hospital!5e0!3m2!1sen!2sin!4v1781632788336!5m2!1sen!2sin'
  },
  {
    id: 'static-9',
    name: 'Triveni Hospital',
    lat: 18.633710382481876,
    lon: 73.7644688749785,
    address: 'Walhekar Wadi Rd, Walhekarwadi, Sector No. 32, Akurdi, Pimpri-Chinchwad, Maharashtra 411033',
    category: 'Hospital',
    image: '/images/Triveni Hospital.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.6743739779167!2d73.7644688749785!3d18.633710382481876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9930b47ee09%3A0x6cc77e8193eaa100!2sTriveni%20Hospital!5e0!3m2!1sen!2sin!4v1781632828524!5m2!1sen!2sin'
  },
  {
    id: 'static-10',
    name: 'Arihant multispeciality hospital',
    lat: 18.643611682474035,
    lon: 73.76846367497878,
    address: 'Main Road, near New English School, Bijali Nagar, Bijlinagar, Akurdi, Pimpri-Chinchwad, Maharashtra 411033',
    category: 'Multispeciality',
    image: '/images/Arihant multispeciality hospital.jpg',
    iframe: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.4540165039775!2d73.76846367497878!3d18.643611682474035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e9fea4ab67%3A0xa31d033faf79c2a8!2sArihant%20multispeciality%20hospital!5e0!3m2!1sen!2sin!4v1781632869486!5m2!1sen!2sin'
  }
];

const CATEGORIES = ['All', 'Hospital', 'Clinic', 'Emergency', 'Multispeciality'];

export default function NearbyHospitals() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredHospitals = staticHospitals.filter(h => {
    const matchCategory = selectedCategory === 'All' || h.category === selectedCategory || (selectedCategory === 'Emergency' && h.category === 'Emergency');
    const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 lg:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {t('nearbyHospitals.title', { defaultValue: 'Our Partner Healthcare Facilities' })}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              {t('nearbyHospitals.subtitle', { defaultValue: 'Explore our trusted network of hospitals, clinics, and emergency centers.' })}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-8">
        
        {/* Filters and Search */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex items-center justify-between gap-4">
          <div className="flex-1 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t('nearbyHospitals.searchPlaceholder', { defaultValue: 'Search by name or address...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <div className="flex items-center gap-2 justify-start sm:justify-end">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t(`nearbyHospitals.cat_${cat}`, { defaultValue: cat })}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hospital Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          <AnimatePresence>
            {filteredHospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group flex flex-col hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img 
                    src={hospital.image} 
                    alt={hospital.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400/e2e8f0/475569?text=Hospital+Image'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <span className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {t(`nearbyHospitals.cat_${hospital.category}`, { defaultValue: hospital.category })}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                    {hospital.name}
                  </h3>
                  
                  <div className="flex items-start gap-2.5 mb-5 text-slate-600 dark:text-slate-400">
                    <MapPinIcon className="h-5 w-5 flex-shrink-0 text-blue-500" />
                    <p className="text-sm line-clamp-3 leading-relaxed">
                      {hospital.address}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-3">
                    {hospital.iframe ? (
                      <button
                        onClick={() => window.open(hospital.iframe.match(/src="([^"]+)"/)?.[1] || hospital.iframe, '_blank')}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-center w-full truncate"
                      >
                        {t('nearbyHospitals.viewLocation', { defaultValue: 'Location' })}
                      </button>
                    ) : (
                      <a
                         href={`https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`}
                         target="_blank"
                         rel="noreferrer"
                         className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-center w-full truncate"
                      >
                        {t('nearbyHospitals.viewMap', { defaultValue: 'View Map' })}
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg shadow-blue-500/30 text-center w-full truncate"
                    >
                      {t('nearbyHospitals.getDirections', { defaultValue: 'Directions' })}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredHospitals.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <BuildingOfficeIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t('nearbyHospitals.noResults', { defaultValue: 'No facilities found' })}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {t('nearbyHospitals.noResultsDesc', { defaultValue: 'Try adjusting your search criteria.' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
