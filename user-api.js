// npm i express axios
const express = require('express');
const axios = require('axios');
const {readFile, readFileSync} = require('fs');
const fs = require('fs');
const app = express();

app.use(express.json());

const port = 3000;
let productList = [];
let willSendData = {status: 'success', results: 0, data: []};

const generateUniqueID = () => {
  if (productList.length === 0) return 0;

  const maxID = Math.max(...productList.map((product) => product.id)); // En büyük ID'yi bul
  return maxID + 1;
};

const fetchUsers = () => {
  try {
    const response = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`));
    productList = response.data;
    willSendData.results = productList.length;
    willSendData.data = productList;
    console.log('Product data fetched successfully');
  } catch (error) {
    console.error('Error fetching product data:', error.message);
  }
};

fetchUsers();

const getAllUsers = (req, res) => {
  if (productList.length === 0) {
    return res.status(404).json({status: 'fail', message: 'No products available'});
  }
  res.status(200).json(willSendData);
};

const getUser = (req, res) => {
  console.log(req.params);

  const product = productList.find((el) => el.id == req.params.id);
  if (!product) {
    return res.status(404).json({status: 'fail', message: 'Product is not found!'});
  }

  res.status(200).json({status: 'success', data: product});
};
const addUser = (req, res) => {
  console.log('REQUEST BODY:', req.body);

  try {
    const lastProduct = productList[productList.length - 1];
    const newID = generateUniqueID();

    const newProduct = {...lastProduct, ...req.body, id: newID};

    productList.push(newProduct);

    willSendData.results = productList.length;
    willSendData.data = productList;

    fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(willSendData), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({
          status: 'fail',
          message: 'Failed to save data',
          error: err.message,
        });
      }
      console.log('Data saved successfully');
      res.status(200).json(willSendData);
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

  const product = productList.find((el) => el.id == req.params.id);
  if (!product) {
    return res.status(404).json({status: 'fail', message: 'Product is not found!'});
  }

  const updatedProduct = {...product, ...req.body};
  productList = productList.map((product) => (product.id == req.params.id ? {...product, ...req.body} : product));

  willSendData.data = productList;

  console.log(willSendData);

  fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(willSendData), (err) => {
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

  const product = productList.find((el) => el.id == req.params.id);
  if (!product) {
    return res.status(404).json({status: 'fail', message: 'Product is not found!'});
  }
  productList = productList.filter((product) => product.id != req.params.id);

  willSendData.results = productList.length;
  willSendData.data = productList;

  fs.writeFile(`${__dirname}/dev-data/data/users.json`, JSON.stringify(willSendData), (err) => {
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
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
