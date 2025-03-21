// npm i express axios
const express = require('express');
const axios = require('axios');
const {readFile, readFileSync} = require('fs');
const fs = require('fs');
const app = express();

app.use(express.json());

const port = 3000;
let userList = [];
let productList = [];
let willSendUserData = {status: 'success', results: 0, data: []};
let willSendProductData = {status: 'success', results: 0, data: []};

const generateUniqueID = () => {
  if (productList.length === 0) return 0;

  const maxID = Math.max(...productList.map((product) => product.id)); // En büyük ID'yi bul
  return maxID + 1;
};

const fetchUsers = () => {
  try {
    const response = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`));
    userList = response.data;
    willSendUserData.results = userList.length;
    willSendUserData.data = userList;
    console.log('User data fetched successfully');
  } catch (error) {
    console.error('Error fetching user data:', error.message);
  }
};
const fetchProducts = () => {
  try {
    const response = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/products.json`));
    productList = response.data;
    willSendProductData.results = productList.length;
    willSendProductData.data = productList;
    console.log('Product data fetched successfully');
  } catch (error) {
    console.error('Error fetching product data:', error.message);
  }
};

fetchUsers();
fetchProducts();

const getAllUsers = (req, res) => {
  if (userList.length === 0) {
    return res.status(404).json({status: 'fail', message: 'No users available'});
  }
  res.status(200).json(willSendUserData);
};
const getAllProducts = (req, res) => {
  if (productList.length === 0) {
    return res.status(404).json({status: 'fail', message: 'No products available'});
  }
  res.status(200).json(willSendProductData);
};

const getUser = (req, res) => {
  console.log(req.params);

  const user = userList.find((el) => el.name.toLowerCase() == req.params.name.toLowerCase());
  if (!user) {
    return res.status(404).json({status: 'fail', message: 'User is not found!'});
  }

  res.status(200).json({status: 'success', data: user});
};
const getProduct = (req, res) => {
  console.log(req.params);

  const product = productList.find((el) => el.name.toLowerCase() == req.params.name.toLowerCase());
  if (!product) {
    return res.status(404).json({status: 'fail', message: 'Product is not found!'});
  }

  res.status(200).json({status: 'success', data: product});
};
const addUser = (req, res) => {
  console.log('REQUEST BODY:', req.body);

  try {
    const lastUser = userList[userList.length - 1];
    const newID = generateUniqueID();

    const newUser = {...lastUser, ...req.body, id: newID, role: 'user'};

    userList.push(newUser);

    willSendUserData.results = userList.length;
    willSendUserData.data = userList;

    fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(willSendUserData), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to save data',
          error: err.message,
        });
      }
      console.log('Data saved successfully');
      res.status(200).json(willSendUserData);
    });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to save data',
      error: error.message,
    });
  }
};
const addProduct = (req, res) => {
  console.log('REQUEST BODY:', req.body);

  try {
    const lastProduct = productList[productList.length - 1];
    const newID = generateUniqueID();

    const newProduct = {...lastProduct, ...req.body, id: newID};

    productList.push(newProduct);

    willSendProductData.results = productList.length;
    willSendProductData.data = productList;

    fs.writeFile(`${__dirname}/dev-data/data/products.json`, JSON.stringify(willSendProductData), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to save data',
          error: err.message,
        });
      }
      console.log('Data saved successfully');
      res.status(200).json(willSendProductData);
    });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Failed to save data',
      error: error.message,
    });
  }
};

const updateUser = (req, res) => {
  console.log(req.params);

  const user = userList.find((el) => el.id == req.params.id);
  if (!user) {
    return res.status(404).json({status: 'fail', message: 'User is not found!'});
  }

  const updatedProduct = {...user, ...req.body};
  userList = userList.map((product) => (product.id == req.params.id ? {...product, ...req.body} : product));

  willSendUserData.data = userList;

  console.log(willSendUserData);

  fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(willSendUserData), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to save data',
        error: err.message,
      });
    }
    console.log('Data saved successfully');
    res.status(200).json(updatedProduct);
  });
};
const updateProduct = (req, res) => {
  console.log(req.params);

  const product = productList.find((el) => el.id == req.params.id);
  if (!product) {
    return res.status(404).json({status: 'fail', message: 'Product is not found!'});
  }

  const updatedProduct = {...product, ...req.body};
  productList = productList.map((product) => (product.id == req.params.id ? {...product, ...req.body} : product));

  willSendProductData.data = productList;

  console.log(willSendProductData);

  fs.writeFile(`${__dirname}/dev-data/data/products.json`, JSON.stringify(willSendProductData), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to save data',
        error: err.message,
      });
    }
    console.log('Data saved successfully');
    res.status(200).json(updatedProduct);
  });
};

const deleteUser = (req, res) => {
  console.log(req.params);

  const user = userList.find((el) => el.id == req.params.id);
  if (!user) {
    return res.status(404).json({status: 'fail', message: 'User is not found!'});
  }
  userList = userList.filter((user) => user.id != req.params.id);

  willSendUserData.results = userList.length;
  willSendUserData.data = userList;

  fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(willSendUserData), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to save data',
        error: err.message,
      });
    }
    console.log('Data saved successfully');
    res.status(204).json({status: 'success', data: null});
  });
};
const deleteProduct = (req, res) => {
  console.log(req.params);

  const product = productList.find((el) => el.id == req.params.id);
  if (!product) {
    return res.status(404).json({status: 'fail', message: 'Product is not found!'});
  }
  productList = productList.filter((product) => product.id != req.params.id);

  willSendProductData.results = productList.length;
  willSendProductData.data = productList;

  fs.writeFile(`${__dirname}/dev-data/data/products.json`, JSON.stringify(willSendProductData), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to save data',
        error: err.message,
      });
    }
    console.log('Data saved successfully');
    res.status(204).json({status: 'success', data: null});
  });
};

app.route('/api/v1/users').get(getAllUsers).post(addUser);
app.route('/api/v1/users/:id').patch(updateUser).delete(deleteUser);
app.route('/api/v1/users/:name').get(getUser);
app.route('/api/v1/products').get(getAllProducts).post(addProduct);
app.route('/api/v1/products/:id').patch(updateProduct).delete(deleteProduct);
app.route('/api/v1/products/:name').get(getProduct);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
