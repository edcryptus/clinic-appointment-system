export const brand = {
  name: "Wellnest Medical Clinic",
  shortName: "Wellnest",
  subName: "Medical Clinic",
  phone: "(02) 8555 0134",
  phoneHref: "tel:+63285550134",
  mobile: "0917 555 0134",
  mobileHref: "tel:+639175550134",
  email: "hello@wellnest.example",
  address: {
    line1: "123 Kalikasan Avenue, Salcedo Village",
    line2: "Makati City",
    note: "Fictional demonstration address. Not a real clinic location.",
  },
  hours: [
    { days: "Monday to Friday", time: "8:00 AM to 6:00 PM" },
    { days: "Saturday", time: "9:00 AM to 1:00 PM" },
    { days: "Sunday", time: "Closed" },
  ],
  // Opening hours used by booking logic. 0 = Sunday.
  openHours: {
    weekdayStart: "08:00",
    weekdayEnd: "18:00",
    saturdayStart: "09:00",
    saturdayEnd: "13:00",
  },
  mapPlaceholderLabel: "Salcedo Village, Makati City (demonstration map)",
  directionsUrl: "https://www.google.com/maps/search/?api=1&query=123+Kalikasan+Avenue+Salcedo+Village+Makati+City",
} as const;
