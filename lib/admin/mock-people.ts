/**
 * Development fixture people for the admin shells (tasks/phase-18-hardening
 * 114, 115). Not real customers: every email is on example.com and every
 * phone number uses the reserved-looking 0170000xxxx / 0180000xxxx ranges.
 *
 * Shared by mock-orders.ts (who placed what) and mock-customers.ts (stats
 * derived from those orders), so the two can never disagree.
 */

export type MockCustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** City as stored on an order's shipping address. */
  city: string;
  area: string;
  joinedAt: string;
};

export const MOCK_CUSTOMER_PROFILES: MockCustomerProfile[] = [
  { id: "CUS-2001", name: "Ayesha Rahman", email: "ayesha.rahman@example.com", phone: "01700000101", city: "Dhaka", area: "Dhanmondi", joinedAt: "2026-05-04T10:12:00.000Z" },
  { id: "CUS-2002", name: "Rafiul Islam", email: "rafiul.islam@example.com", phone: "01800000102", city: "Chattogram", area: "Agrabad", joinedAt: "2026-05-11T08:30:00.000Z" },
  { id: "CUS-2003", name: "Nusrat Jahan", email: "nusrat.jahan@example.com", phone: "01700000103", city: "Dhaka", area: "Mirpur 10", joinedAt: "2026-05-19T15:45:00.000Z" },
  { id: "CUS-2004", name: "Tanvir Hasan", email: "tanvir.hasan@example.com", phone: "01800000104", city: "Rajshahi", area: "Shaheb Bazar", joinedAt: "2026-05-27T12:10:00.000Z" },
  { id: "CUS-2005", name: "Sabbir Ahmed", email: "sabbir.ahmed@example.com", phone: "01700000105", city: "Dhaka", area: "Uttara Sector 7", joinedAt: "2026-06-02T09:20:00.000Z" },
  { id: "CUS-2006", name: "Farhana Akter", email: "farhana.akter@example.com", phone: "01800000106", city: "Khulna", area: "Sonadanga", joinedAt: "2026-06-08T11:00:00.000Z" },
  { id: "CUS-2007", name: "Mahmudul Hasan Rony", email: "mahmudul.rony@example.com", phone: "01700000107", city: "Sylhet", area: "Zindabazar", joinedAt: "2026-06-15T14:05:00.000Z" },
  { id: "CUS-2008", name: "Sadia Islam Mim", email: "sadia.mim@example.com", phone: "01800000108", city: "Dhaka", area: "Mohammadpur", joinedAt: "2026-06-21T16:40:00.000Z" },
  { id: "CUS-2009", name: "Arif Hossain", email: "arif.hossain@example.com", phone: "01700000109", city: "Gazipur", area: "Tongi", joinedAt: "2026-06-30T07:55:00.000Z" },
  { id: "CUS-2010", name: "Tahmid Chowdhury", email: "tahmid.chowdhury@example.com", phone: "01800000110", city: "Chattogram", area: "Nasirabad", joinedAt: "2026-07-06T13:25:00.000Z" },
  { id: "CUS-2011", name: "Jannatul Ferdous", email: "jannatul.ferdous@example.com", phone: "01700000111", city: "Cumilla", area: "Kandirpar", joinedAt: "2026-07-13T10:45:00.000Z" },
  { id: "CUS-2012", name: "Imran Kabir", email: "imran.kabir@example.com", phone: "01800000112", city: "Dhaka", area: "Bashundhara R/A", joinedAt: "2026-07-20T18:15:00.000Z" },
  { id: "CUS-2013", name: "Shahriar Alam", email: "shahriar.alam@example.com", phone: "01700000113", city: "Mymensingh", area: "Ganginarpar", joinedAt: "2026-07-29T09:35:00.000Z" },
  { id: "CUS-2014", name: "Maliha Tabassum", email: "maliha.tabassum@example.com", phone: "01800000114", city: "Narayanganj", area: "Chashara", joinedAt: "2026-08-05T12:50:00.000Z" },
  { id: "CUS-2015", name: "Rakibul Hasan", email: "rakibul.hasan@example.com", phone: "01700000115", city: "Barishal", area: "Band Road", joinedAt: "2026-08-14T08:05:00.000Z" },
  { id: "CUS-2016", name: "Nafisa Anjum", email: "nafisa.anjum@example.com", phone: "01800000116", city: "Rangpur", area: "Jahaj Company More", joinedAt: "2026-08-23T17:30:00.000Z" },
  { id: "CUS-2017", name: "Ehsanul Karim", email: "ehsanul.karim@example.com", phone: "01700000117", city: "Bogura", area: "Satmatha", joinedAt: "2026-09-12T11:20:00.000Z" },
  { id: "CUS-2018", name: "Lamia Sultana", email: "lamia.sultana@example.com", phone: "01800000118", city: "Dhaka", area: "Banani", joinedAt: "2026-10-02T15:10:00.000Z" },
];

/** Customers with no orders yet — signed up, never bought. */
export const MOCK_CUSTOMERS_WITHOUT_ORDERS = new Set(["CUS-2017", "CUS-2018"]);
