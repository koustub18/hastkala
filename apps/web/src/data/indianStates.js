export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

export const extractOriginState = (product) => {
  if (!product) return '';
  if (product.originState && typeof product.originState === 'string' && product.originState.trim()) {
    return product.originState.trim();
  }
  if (product.state && typeof product.state === 'string' && product.state.trim()) {
    return product.state.trim();
  }
  if (product.region && typeof product.region === 'string' && product.region.trim()) {
    const regionStr = product.region.trim();
    const matched = INDIAN_STATES.find(s => regionStr.toLowerCase().includes(s.toLowerCase()));
    if (matched) return matched;
    return regionStr;
  }
  return '';
};
