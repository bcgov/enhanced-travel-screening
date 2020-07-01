/* eslint-disable no-console */

/**
 * Flatten nested collection
 *
 * @param {*} a
 */
const flatten = (a) => [].concat(...a);

/**
 * Add items into array
 *
 * @param {*} array
 * @param {*} item
 */
const merge = (array, item) => flatten([...array, item]).filter(
  (value, index, self) => self.indexOf(value) === index,
);

/**
 * Lowercase, remove diacritics, remove special characters and whitespace
 *
 * @param {*} s
 */
const cleanString = (s) => {
  if (!s) {
    return s;
  }
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w]/gi, '');
};

/**
 * Simplify addresses into a "clean" version for comparison
 *
 * @param baseAddress
 * @return
 */
const transformAddress = (baseAddress) => {
  if (!baseAddress) {
    return null;
  }

  return String(baseAddress)
    .toLowerCase()
    .replace(/[^\w]/gi, ' ').split(' ')
    .filter((item) => ![
      '',
      'ave',
      'avenue',
      'blvd',
      'boulevard',
      'cres',
      'crescent',
      'court',
      'dr',
      'drive',
      'lane',
      'pl',
      'place',
      'rd',
      'road',
      'st',
      'street',
      'way',
      'apt',
      'apartment',
      'basement',
      'suit',
      'suite',
      'unit',
    ].includes(item))
    .join('-');
};

/**
 * Compare two dates and return true if within a provided range (# of days)
 *
 * @param {*} s1
 * @param {*} s2
 * @param {*} tolerateDays
 */
const compareDates = (s1, s2, tolerateDays) => {
  if (!s1 || !s2) return false;
  const d1 = parseInt(cleanString(s1), 10);
  const d2 = parseInt(cleanString(s2), 10);
  const daysBetween = Math.abs(d1 - d2);
  return daysBetween <= tolerateDays;
};

/**
 * Derive a map of unique ETS entries we can compare against
 *
 * @param ets ETS collection
 * @return Map of derived keys to corresponding ETS confirmation codes
 * (note: could be multiple in case of internal dupes)
 */
/* eslint-disable no-restricted-syntax */
const createEtsKeys = (ets) => {
  const etsKeys = [];

  for (const etsRecord of ets) {
    if (etsRecord.telephone) {
      const phoneKey = cleanString(etsRecord.telephone);
      if (etsKeys[phoneKey]) {
        etsKeys[phoneKey] = merge(etsKeys[phoneKey], etsRecord.id);
      } else {
        etsKeys[phoneKey] = [etsRecord.id];
      }
    }

    const derivedKey = etsRecord.derivedTravellerKey;
    if (derivedKey) {
      if (etsKeys[derivedKey]) {
        etsKeys[derivedKey] = merge(etsKeys[derivedKey], etsRecord.id);
      } else {
        etsKeys[derivedKey] = [etsRecord.id];
      }
    }

    const addresses = [
      etsRecord.address,
      etsRecord.isoAddress,
    ];

    const dob = [
      etsRecord.dob,
      etsRecord.traveller0Dob,
      etsRecord.traveller1Dob,
      etsRecord.traveller2Dob,
      etsRecord.traveller3Dob,
      etsRecord.traveller4Dob,
      etsRecord.traveller5Dob,
      etsRecord.traveller6Dob,
      etsRecord.traveller7Dob,
      etsRecord.traveller8Dob,
      etsRecord.traveller9Dob,
    ].filter((item) => item);

    const derivedDobAddressKeys = [];
    for (let i = 0; i < addresses.length; i += 1) {
      for (let j = 0; j < dob.length; j += 1) {
        derivedDobAddressKeys.push(`${transformAddress(addresses[i])}${cleanString(dob[j])}`);
      }
    }

    for (const key of derivedDobAddressKeys) {
      if (etsKeys[key]) {
        etsKeys[key] = merge(etsKeys[key], etsRecord.id);
      } else {
        etsKeys[key] = [etsRecord.id];
      }
    }
  }
  return etsKeys;
};

/**
 * Print out the results of duplicate matching, calling supporting detection methods
 *
 * @param db
 */
const markDuplicates = async (etsCollection, phacCollection) => {
  console.log('Loading collections from database');

  const phac = await phacCollection.aggregate([
    {
      $match: {
        'serviceBCTransactions.status': { $ne: 'success' },
      },
    }, {
      $project: {
        _id: 0,
        covid_id: 1,
        arrival_date: 1,
        home_phone: 1,
        mobile_phone: 1,
        other_phone: 1,
        derivedTravellerKey: 1,
        address_1: 1,
        date_of_birth: 1,
      },
    },
  ]).toArray();
  console.log(`Loaded ${phac.length} PHAC entries requiring processing`);

  const ets = await etsCollection.aggregate([
    {
      $addFields: {
        traveller0Dob: { $arrayElemAt: ['$additionalTravellers.dob', 0] },
        traveller1Dob: { $arrayElemAt: ['$additionalTravellers.dob', 1] },
        traveller2Dob: { $arrayElemAt: ['$additionalTravellers.dob', 2] },
        traveller3Dob: { $arrayElemAt: ['$additionalTravellers.dob', 3] },
        traveller4Dob: { $arrayElemAt: ['$additionalTravellers.dob', 4] },
        traveller5Dob: { $arrayElemAt: ['$additionalTravellers.dob', 5] },
        traveller6Dob: { $arrayElemAt: ['$additionalTravellers.dob', 6] },
        traveller7Dob: { $arrayElemAt: ['$additionalTravellers.dob', 7] },
        traveller8Dob: { $arrayElemAt: ['$additionalTravellers.dob', 8] },
        traveller9Dob: { $arrayElemAt: ['$additionalTravellers.dob', 9] },
        isoAddress: '$isolationPlan.address',
        arrivalDate: '$arrival.date',
      },
    },
    {
      $project: {
        _id: 0,
        telephone: 1,
        id: 1,
        derivedTravellerKey: 1,
        address: 1,
        dob: 1,
        traveller0Dob: 1,
        traveller1Dob: 1,
        traveller2Dob: 1,
        traveller3Dob: 1,
        traveller4Dob: 1,
        traveller5Dob: 1,
        traveller6Dob: 1,
        traveller7Dob: 1,
        traveller8Dob: 1,
        traveller9Dob: 1,
        arrivalDate: 1,
        isoAddress: 1,
      },
    },
  ]).toArray();

  // Maps to store keys representing different aspects of the entries from ETS and PHAC
  const duplicates = [];
  const etsKeys = createEtsKeys(ets);
  const phacKeys = [];

  let internalPhacDuplicateCount = 0;
  let phacToEtsDuplicateCount = 0;

  // Iterate through the PHAC collection
  for (const phacEntry of phac) {
    // Load entry data
    const covidId = phacEntry.covid_id;
    const phacArrivalDate = phacEntry.arrival_date;
    const phacEntryKeys = [];
    const phacPhones = [
      cleanString(phacEntry.home_phone),
      cleanString(phacEntry.mobile_phone),
      cleanString(phacEntry.other_phone),
    ];
    // Create keys for the entry
    phacPhones.forEach((item) => { if (item) { phacEntryKeys.push(item); } });
    if (phacEntry.derivedTravellerKey != null) phacEntryKeys.push(phacEntry.derivedTravellerKey);
    phacEntryKeys.push(`${transformAddress(phacEntry.address_1)}${cleanString(phacEntry.date_of_birth)}`);

    // Iterate through the keys to compare against our collections
    for (const phacKey of phacEntryKeys) {
      // Check if PHAC already contains any of our keys, if not then add them
      if (phacKeys[phacKey] && phacKeys[phacKey] !== covidId) {
        // Match found, compare dates to see if within a week or not
        if (compareDates(
          phacArrivalDate, phac.find((item) => item.covid_id === covidId).arrival_date, 7,
        )) {
          if (duplicates[covidId]) {
            duplicates[covidId] = merge(duplicates[covidId], phacKeys[phacKey]);
          } else {
            duplicates[covidId] = flatten([phacKeys[phacKey]]);
            internalPhacDuplicateCount += 1;
          }
        }
      } else {
        phacKeys[phacKey] = covidId;
      }

      // Check if ETS contains any of our keys
      if (etsKeys[phacKey]) {
        // Extract dates
        const etsDates = [];

        for (const etsCode of etsKeys[phacKey]) {
          etsDates.push(ets.find((item) => item.id === etsCode).arrivalDate);
        }

        // If not within a date range of any ETS match, treat as unique
        const insideRange = etsDates.find((item) => compareDates(phacArrivalDate, item, 7));
        if (insideRange) {
          if (duplicates[covidId]) {
            duplicates[covidId] = merge(duplicates[covidId], etsKeys[phacKey]);
          } else {
            duplicates[covidId] = flatten([etsKeys[phacKey]]);
            phacToEtsDuplicateCount += 1;
          }
        }
      }
    }

    // If we found a duplicate in either collection, update the record
    if (duplicates[covidId]) {
      await phacCollection.updateOne( // eslint-disable-line no-await-in-loop
        { covid_id: covidId },
        {
          $push: {
            serviceBCTransactions: {
              status: 'success',
              duplicateIds: duplicates[covidId],
              processedAt: new Date().toISOString(),
            },
          },
          $set: { updatedAt: new Date().toISOString() },
        },
      );
    }
  }

  // Report summary of results
  console.log(`Found ${Object.entries(duplicates).length} total duplicates`);
  console.log(`--- ${internalPhacDuplicateCount} duplicates or groups within the PHAC collection`);
  console.log(`--- ${phacToEtsDuplicateCount} duplicates or groups of PHAC records found in the ETS collection`);

  return {
    totalDuplicates: Object.entries(duplicates).length,
    internalPhacDuplicateCount,
    phacToEtsDuplicateCount,
  };
};

module.exports = markDuplicates;
