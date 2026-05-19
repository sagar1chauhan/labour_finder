const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/public/home-content');
    console.log('Status Code:', res.status);
    console.log('Success:', res.data.success);
    console.log('Has Categories:', !!res.data.categories);
    if (res.data.categories) {
      console.log('Categories Count:', res.data.categories.length);
      console.log('Category Titles:', res.data.categories.map(c => c.title));
    }
  } catch (err) {
    console.error('Error fetching API:', err.message);
  }
}

test();
