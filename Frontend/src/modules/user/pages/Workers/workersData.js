const STATIC_WORKERS = [
  {
    id: 1,
    name: "Ramesh Kumar",
    type: "Plumber work",
    rating: "4.8 (124 reviews)",
    experience: "5 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    name: "Suresh Singh",
    type: "Electrician",
    rating: "4.9 (201 reviews)",
    experience: "8 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    name: "Amit Sharma",
    type: "Carpenter",
    rating: "4.7 (89 reviews)",
    experience: "3 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 4,
    name: "Vikram Patel",
    type: "Architect",
    rating: "4.9 (340 reviews)",
    experience: "10 Years",
    tab: "Planning",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 5,
    name: "Rahul Verma",
    type: "Engineer",
    rating: "4.8 (150 reviews)",
    experience: "6 Years",
    tab: "Inspection",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 6,
    name: "Prakash Yadav",
    type: "Mason & Labour",
    rating: "4.6 (95 reviews)",
    experience: "4 Years",
    tab: "Labour",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 7,
    name: "Priya Singh",
    type: "Architect",
    rating: "4.9 (180 reviews)",
    experience: "7 Years",
    tab: "Planning",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 8,
    name: "Rahul Desai",
    type: "Architect",
    rating: "4.7 (120 reviews)",
    experience: "4 Years",
    tab: "Planning",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 9,
    name: "Neha Gupta",
    type: "Architect",
    rating: "4.8 (210 reviews)",
    experience: "9 Years",
    tab: "Planning",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 10,
    name: "Sanjay Kumar",
    type: "Engineer",
    rating: "4.9 (300 reviews)",
    experience: "12 Years",
    tab: "Inspection",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 11,
    name: "Manoj Builders",
    type: "Building contractor",
    rating: "4.8 (240 reviews)",
    experience: "15 Years",
    tab: "Contract",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 12,
    name: "Apex Renovations",
    type: "Renovation contractor",
    rating: "4.7 (195 reviews)",
    experience: "8 Years",
    tab: "Contract",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 13,
    name: "Dream Interiors",
    type: "Interior contractor",
    rating: "4.9 (310 reviews)",
    experience: "10 Years",
    tab: "Contract",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 14,
    name: "Rao Construction Co.",
    type: "Building contractor",
    rating: "4.6 (150 reviews)",
    experience: "12 Years",
    tab: "Contract",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 15,
    name: "Modern Living Interiors",
    type: "Interior contractor",
    rating: "4.8 (185 reviews)",
    experience: "6 Years",
    tab: "Contract",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 16,
    name: "Rajesh Kumar (JCB Operator)",
    type: "JCB",
    rating: "4.8 (142 reviews)",
    experience: "6 Years",
    tab: "Operation",
    image: "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 17,
    name: "Gurnam Singh (Tractor Service)",
    type: "Tractor",
    rating: "4.9 (185 reviews)",
    experience: "10 Years",
    tab: "Operation",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 18,
    name: "Harpreet Singh (Tempo Service)",
    type: "Tempo",
    rating: "4.7 (96 reviews)",
    experience: "4 Years",
    tab: "Transport",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 19,
    name: "Satnam Cargo (Eicher Service)",
    type: "Eicher",
    rating: "4.8 (215 reviews)",
    experience: "8 Years",
    tab: "Transport",
    image: "https://images.unsplash.com/photo-1592838064575-70ed626d3a44?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 20,
    name: "Vikram Crane Services",
    type: "Crane",
    rating: "4.9 (132 reviews)",
    experience: "7 Years",
    tab: "Operation",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 21,
    name: "Balaji Water Supply",
    type: "Water Tanker",
    rating: "4.6 (180 reviews)",
    experience: "5 Years",
    tab: "Transport",
    image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 22,
    name: "Karan Machine Rentals",
    type: "Mixture",
    rating: "4.8 (88 reviews)",
    experience: "5 Years",
    tab: "Rental",
    image: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 23,
    name: "Rakesh Breaker Works",
    type: "Breaker",
    rating: "4.7 (76 reviews)",
    experience: "3 Years",
    tab: "Rental",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 24,
    name: "Verma Compressor Rentals",
    type: "Compressor",
    rating: "4.8 (94 reviews)",
    experience: "6 Years",
    tab: "Rental",
    image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 25,
    name: "Anand Deshmukh",
    type: "Supervisor",
    rating: "4.9 (112 reviews)",
    experience: "8 Years",
    tab: "Inspection",
    image: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 26,
    name: "Komal Sharma",
    type: "Home decor",
    rating: "4.8 (145 reviews)",
    experience: "5 Years",
    tab: "Planning",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 27,
    name: "Devendra Maurya",
    type: "Tile fixer",
    rating: "4.7 (104 reviews)",
    experience: "6 Years",
    tab: "Labour",
    image: "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 28,
    name: "Manoj Painter",
    type: "Painter",
    rating: "4.8 (158 reviews)",
    experience: "7 Years",
    tab: "Labour",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 29,
    name: "Ram Chandra Plastering",
    type: "Plaster & dismantler",
    rating: "4.6 (85 reviews)",
    experience: "4 Years",
    tab: "Labour",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 30,
    name: "Jagdish Prasad",
    type: "Bar Bander",
    rating: "4.7 (92 reviews)",
    experience: "5 Years",
    tab: "Labour",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 31,
    name: "Radhe Shuttering Works",
    type: "Shuttering",
    rating: "4.8 (115 reviews)",
    experience: "6 Years",
    tab: "Labour",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80"
  },

  // House keeping (10 workers)
  {
    id: 32,
    name: "Rajesh Solanki",
    type: "House keeping",
    rating: "4.8 (120 reviews)",
    experience: "5 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 33,
    name: "Sunita Devi",
    type: "House keeping",
    rating: "4.9 (95 reviews)",
    experience: "6 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 34,
    name: "Anil Verma",
    type: "House keeping",
    rating: "4.7 (88 reviews)",
    experience: "4 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 35,
    name: "Meena Sharma",
    type: "House keeping",
    rating: "4.9 (150 reviews)",
    experience: "7 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1603712726207-4f86d63ef80f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 36,
    name: "Manoj Pawar",
    type: "House keeping",
    rating: "4.6 (110 reviews)",
    experience: "3 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 37,
    name: "Kamla Bai",
    type: "House keeping",
    rating: "4.8 (210 reviews)",
    experience: "8 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 38,
    name: "Sanjay Rathore",
    type: "House keeping",
    rating: "4.7 (75 reviews)",
    experience: "5 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 39,
    name: "Rekha Choudhary",
    type: "House keeping",
    rating: "4.9 (135 reviews)",
    experience: "6 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 40,
    name: "Vinod Yadav",
    type: "House keeping",
    rating: "4.8 (90 reviews)",
    experience: "4 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1627690049830-af7f1d54a240?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 41,
    name: "Seema Patil",
    type: "House keeping",
    rating: "4.9 (180 reviews)",
    experience: "9 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1580252504476-065d6ff70b18?auto=format&fit=crop&w=400&q=80"
  },

  // Electrician service (10 workers)
  {
    id: 42,
    name: "Ramesh Chandra",
    type: "Electrician service",
    rating: "4.9 (240 reviews)",
    experience: "8 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 43,
    name: "Vikram Gohil",
    type: "Electrician service",
    rating: "4.8 (180 reviews)",
    experience: "6 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 44,
    name: "Dilip Kumar",
    type: "Electrician service",
    rating: "4.7 (120 reviews)",
    experience: "5 Years",
    tab: "Installation",
    image: "https://images.unsplash.com/photo-1460518451285-cd3ab4204672?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 45,
    name: "Suresh Rawat",
    type: "Electrician service",
    rating: "4.9 (310 reviews)",
    experience: "10 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1558402529-d2638a7023ef?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 46,
    name: "Amit Patel",
    type: "Electrician service",
    rating: "4.6 (95 reviews)",
    experience: "4 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 47,
    name: "Harish Sharma",
    type: "Electrician service",
    rating: "4.8 (155 reviews)",
    experience: "7 Years",
    tab: "Installation",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 48,
    name: "Naresh Sen",
    type: "Electrician service",
    rating: "4.7 (85 reviews)",
    experience: "3 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 49,
    name: "Jitendra Joshi",
    type: "Electrician service",
    rating: "4.9 (200 reviews)",
    experience: "9 Years",
    tab: "Installation",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 50,
    name: "Mahesh Vyas",
    type: "Electrician service",
    rating: "4.8 (115 reviews)",
    experience: "5 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 51,
    name: "Rakesh Mishra",
    type: "Electrician service",
    rating: "4.9 (275 reviews)",
    experience: "11 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80"
  },

  // Plumbing service (10 workers)
  {
    id: 52,
    name: "Manoj Kumar",
    type: "Plumbing service",
    rating: "4.8 (150 reviews)",
    experience: "6 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 53,
    name: "Pappu Yadav",
    type: "Plumbing service",
    rating: "4.9 (210 reviews)",
    experience: "9 Years",
    tab: "Installation",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 54,
    name: "Sunil Sharma",
    type: "Plumbing service",
    rating: "4.7 (95 reviews)",
    experience: "4 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 55,
    name: "Devendra Singh",
    type: "Plumbing service",
    rating: "4.9 (180 reviews)",
    experience: "8 Years",
    tab: "Installation",
    image: "https://images.unsplash.com/photo-1542013936693-8848e5740a95?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 56,
    name: "Vinay Solanki",
    type: "Plumbing service",
    rating: "4.6 (80 reviews)",
    experience: "3 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1585538897177-33d39589d150?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 57,
    name: "Raju Rathore",
    type: "Plumbing service",
    rating: "4.8 (140 reviews)",
    experience: "5 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 58,
    name: "Gopal Lal",
    type: "Plumbing service",
    rating: "4.7 (75 reviews)",
    experience: "4 Years",
    tab: "Installation",
    image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 59,
    name: "Sanjay Sen",
    type: "Plumbing service",
    rating: "4.9 (230 reviews)",
    experience: "10 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 60,
    name: "Dinesh Gehlot",
    type: "Plumbing service",
    rating: "4.8 (110 reviews)",
    experience: "5 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 61,
    name: "Ashok Kumar",
    type: "Plumbing service",
    rating: "4.9 (260 reviews)",
    experience: "12 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80"
  },

  // Cleaning services (10 workers)
  {
    id: 62,
    name: "Geeta Bai",
    type: "Cleaning services",
    rating: "4.9 (320 reviews)",
    experience: "10 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 63,
    name: "Santosh Yadav",
    type: "Cleaning services",
    rating: "4.8 (165 reviews)",
    experience: "6 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 64,
    name: "Pooja Sharma",
    type: "Cleaning services",
    rating: "4.7 (110 reviews)",
    experience: "4 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 65,
    name: "Prem Singh",
    type: "Cleaning services",
    rating: "4.9 (240 reviews)",
    experience: "8 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1603712726207-4f86d63ef80f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 66,
    name: "Lalita Devi",
    type: "Cleaning services",
    rating: "4.6 (85 reviews)",
    experience: "3 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 67,
    name: "Deepak Pawar",
    type: "Cleaning services",
    rating: "4.8 (130 reviews)",
    experience: "5 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 68,
    name: "Kiran Bai",
    type: "Cleaning services",
    rating: "4.7 (95 reviews)",
    experience: "4 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 69,
    name: "Asha Choudhary",
    type: "Cleaning services",
    rating: "4.9 (205 reviews)",
    experience: "7 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 70,
    name: "Mohan Lal",
    type: "Cleaning services",
    rating: "4.8 (120 reviews)",
    experience: "5 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1627690049830-af7f1d54a240?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 71,
    name: "Sharda Sen",
    type: "Cleaning services",
    rating: "4.9 (180 reviews)",
    experience: "9 Years",
    tab: "Cleaning",
    image: "https://images.unsplash.com/photo-1580252504476-065d6ff70b18?auto=format&fit=crop&w=400&q=80"
  },

  // Mechanic service (10 workers)
  {
    id: 72,
    name: "Satish Verma",
    type: "Mechanic service",
    rating: "4.9 (280 reviews)",
    experience: "10 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 73,
    name: "Rahul Rathore",
    type: "Mechanic service",
    rating: "4.8 (190 reviews)",
    experience: "7 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 74,
    name: "Vijay Kumar",
    type: "Mechanic service",
    rating: "4.7 (130 reviews)",
    experience: "5 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 75,
    name: "Dharmendra Singh",
    type: "Mechanic service",
    rating: "4.9 (320 reviews)",
    experience: "12 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1530047625168-4b18fa25d2cf?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 76,
    name: "Kamal Kishore",
    type: "Mechanic service",
    rating: "4.6 (95 reviews)",
    experience: "4 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1516655855035-d5215bcb5604?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 77,
    name: "Ravi Sen",
    type: "Mechanic service",
    rating: "4.8 (160 reviews)",
    experience: "6 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 78,
    name: "Ajay Solanki",
    type: "Mechanic service",
    rating: "4.7 (80 reviews)",
    experience: "3 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1617406181409-c7194ad33c6a?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 79,
    name: "Nitin Gupta",
    type: "Mechanic service",
    rating: "4.9 (215 reviews)",
    experience: "8 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 80,
    name: "Sanjay Gehlot",
    type: "Mechanic service",
    rating: "4.8 (145 reviews)",
    experience: "5 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1519752598383-2f3107bf5114?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 81,
    name: "Jagdish Prasad",
    type: "Mechanic service",
    rating: "4.9 (290 reviews)",
    experience: "11 Years",
    tab: "Repairing",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80"
  }
];

const CATEGORIES_TO_BACKFILL = [
  "Architect", "Engineer", "Supervisor", "Home decor",
  "Tile fixer", "Plumber work", "Carpenter", "Electrician", "Painter", "Plaster & dismantler", "Bar Bander", "Shuttering",
  "Building contractor", "Renovation contractor", "Interior contractor",
  "JCB", "Tractor", "Tempo", "Eicher", "Crane", "Water Tanker",
  "Mixture", "Breaker", "Compressor",
  "House keeping", "Electrician service", "Plumbing service", "Cleaning services", "Mechanic service"
];

const CATEGORY_IMAGES = {
  "Architect": [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80"
  ],
  "Engineer": [
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80"
  ],
  "Supervisor": [
    "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80"
  ],
  "Home decor": [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80"
  ],
  "Tile fixer": [
    "https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80"
  ],
  "Plumber work": [
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80"
  ],
  "Carpenter": [
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80"
  ],
  "Electrician": [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1460518451285-cd3ab4204672?auto=format&fit=crop&w=400&q=80"
  ],
  "Painter": [
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80"
  ],
  "Plaster & dismantler": [
    "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80"
  ],
  "Bar Bander": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  ],
  "Shuttering": [
    "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80"
  ],
  "Building contractor": [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  ],
  "Renovation contractor": [
    "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=400&q=80"
  ],
  "Interior contractor": [
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80"
  ],
  "JCB": [
    "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80"
  ],
  "Tractor": [
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1530263003720-efe580a5813f?auto=format&fit=crop&w=400&q=80"
  ],
  "Tempo": [
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1516576885502-d4995b453e7c?auto=format&fit=crop&w=400&q=80"
  ],
  "Eicher": [
    "https://images.unsplash.com/photo-1592838064575-70ed626d3a44?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=400&q=80"
  ],
  "Crane": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1542362567-b07eac790abc?auto=format&fit=crop&w=400&q=80"
  ],
  "Water Tanker": [
    "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=400&q=80"
  ],
  "Mixture": [
    "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80"
  ],
  "Breaker": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
  ],
  "Compressor": [
    "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=400&q=80"
  ],
  "House keeping": [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80"
  ],
  "Electrician service": [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=400&q=80"
  ],
  "Plumbing service": [
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=400&q=80"
  ],
  "Cleaning services": [
    "https://images.unsplash.com/photo-1603712726207-4f86d63ef80f?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=400&q=80"
  ],
  "Mechanic service": [
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=400&q=80"
  ]
};

const CATEGORY_TABS = {
  "Architect": "Planning",
  "Engineer": "Inspection",
  "Supervisor": "Inspection",
  "Home decor": "Planning",
  "Tile fixer": "Labour",
  "Plumber work": "Repairing",
  "Carpenter": "Repairing",
  "Electrician": "Repairing",
  "Painter": "Labour",
  "Plaster & dismantler": "Labour",
  "Bar Bander": "Labour",
  "Shuttering": "Labour",
  "Building contractor": "Contract",
  "Renovation contractor": "Contract",
  "Interior contractor": "Contract",
  "JCB": "Operation",
  "Tractor": "Operation",
  "Tempo": "Transport",
  "Eicher": "Transport",
  "Crane": "Operation",
  "Water Tanker": "Transport",
  "Mixture": "Rental",
  "Breaker": "Rental",
  "Compressor": "Rental",
  "House keeping": "Cleaning",
  "Electrician service": "Repairing",
  "Plumbing service": "Repairing",
  "Cleaning services": "Cleaning",
  "Mechanic service": "Repairing"
};

const INDIAN_FIRST_NAMES = [
  "Rajesh", "Suresh", "Ramesh", "Amit", "Vikram", "Rahul", "Prakash", "Sanjay", "Manoj", "Sunil",
  "Vinod", "Harish", "Jitendra", "Mahesh", "Rakesh", "Gopal", "Dinesh", "Ashok", "Nitin", "Satish",
  "Ajay", "Vijay", "Anand", "Devendra", "Karan", "Komal", "Pappu", "Sunita", "Meena", "Kamla",
  "Rekha", "Seema", "Geeta", "Sharda", "Pooja", "Priya", "Neha", "Asha", "Lalita", "Kiran"
];

const INDIAN_LAST_NAMES = [
  "Kumar", "Singh", "Sharma", "Patel", "Verma", "Yadav", "Desai", "Gupta", "Pawar", "Rathore",
  "Choudhary", "Sen", "Joshi", "Vyas", "Mishra", "Lal", "Gehlot", "Maurya", "Solanki", "Gohil",
  "Rawat", "Deshmukh"
];

const generateName = (category, index) => {
  if (category.toLowerCase().includes("contractor") || category.toLowerCase().includes("supply") || category.toLowerCase().includes("rental")) {
    const companyTypes = ["Builders", "Renovations", "Interiors", "Services", "Associates", "Contractors"];
    const lastName = INDIAN_LAST_NAMES[index % INDIAN_LAST_NAMES.length];
    const type = companyTypes[index % companyTypes.length];
    return `${lastName} ${type}`;
  }
  const firstName = INDIAN_FIRST_NAMES[index % INDIAN_FIRST_NAMES.length];
  const lastName = INDIAN_LAST_NAMES[(index + 3) % INDIAN_LAST_NAMES.length];
  return `${firstName} ${lastName}`;
};

const generatedWorkers = [];
let nextId = 100;

CATEGORIES_TO_BACKFILL.forEach(category => {
  const existingCount = STATIC_WORKERS.filter(w => w.type.toLowerCase() === category.toLowerCase()).length;
  const needed = 10 - existingCount;

  for (let i = 0; i < needed; i++) {
    const images = CATEGORY_IMAGES[category] || [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
    ];
    const image = images[i % images.length];
    const tab = CATEGORY_TABS[category] || "Labour";
    const name = generateName(category, i);
    const ratingVal = (4.5 + (i % 5) * 0.1).toFixed(1);
    const reviewsCount = 50 + (i * 23);
    const rating = `${ratingVal} (${reviewsCount} reviews)`;
    const experience = `${3 + (i % 8)} Years`;

    generatedWorkers.push({
      id: nextId++,
      name,
      type: category,
      rating,
      experience,
      tab,
      image
    });
  }
});

export const DUMMY_WORKERS = [...STATIC_WORKERS, ...generatedWorkers];
