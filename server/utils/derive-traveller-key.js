// Diacritic removal logic from https://stackoverflow.com/a/37511463/7679591
const cleanString = (s) => String(s)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\w]/gi, '');

const deriveTravellerKey = (item) => {
  const components = [
    item.firstName || item.first_name,
    item.lastName || item.last_name,
    item.dob || item.date_of_birth,
    item.arrival && item.arrival.date ? item.arrival.date : item.arrival_date,
  ];
  components.forEach((i) => {
    if (typeof i !== 'string') throw Error('All identifier components must be strings');
  });
  return components.map(cleanString).join('');
};

module.exports = deriveTravellerKey;
