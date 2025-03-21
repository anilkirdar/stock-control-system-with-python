import requests 

# products = {'apple': {'name': 'Apple', 'quantity': 10, 'price': 5}, 'banana': {'name': 'Banana', 'quantity': 5, 'price': 10}}
# users = {'admin': {'role': 'admin', 'password': '1234'}, 'anil123': {'role': 'user', 'password': '1234'}}

baseUrl = 'http://127.0.0.1:3000'
productsUrl = f'{baseUrl}/api/v1/products'
usersUrl = f'{baseUrl}/api/v1/users'

# getUsers = requests.get(usersUrl)
# users = getUsers.json()
# users = users['data']

# getProducts = requests.get(productsUrl)
# products = getProducts.json()
# products = products['data']

# Menü gösterme
def displayMenu(role):
    if role == 'admin':
        print('\n1: Add Product\n2: Remove Product\n3: Search Product\n4: Exit')
    else:
        print('\n1: Search Product\n2: Exit')

# Ürün arama işlemi
def searchProduct():
    name = input("Product Name: ").strip().lower()
    product = requests.get(f'{productsUrl}/{name}').json()
    if(product['status'] == 'success'):
        product = product['data']
        print(f"Product name: {product['name']}, quantity: {product['quantity']}, price: {product['price']}")
        return
    else:
        print("Product not found.")

# Ürün ekleme işlemi
def addProduct():
    name = input("Product Name: ").strip()
    quantity = int(input("Quantity: "))
    product = requests.get(f'{productsUrl}/{name}').json()
    if(product['status'] == 'success'):
        product = product['data']
        product["quantity"] += quantity
        requests.patch(f'{productsUrl}/{product['id']}', json={'quantity': product['quantity']})
        print(f"{name} quantity updated to {product['quantity']}.")
        return
    price = float(input("Price: "))
    newProduct = {
        "name": name,
        "quantity": quantity,
        "price": price
    }
    requests.post(productsUrl, json=newProduct)
    print(f"{name} added successfully.")

# Ürün silme işlemi
def removeProduct():
    name = input("Product Name: ").strip()
    product = requests.get(f'{productsUrl}/{name}').json()
    quantity = int(input("Quantity: "))
    if(product['status'] == 'success'):
        product = product['data']
        if product["quantity"] >= quantity:
            product["quantity"] -= quantity
            if product["quantity"] == 0:
                requests.delete(f'{productsUrl}/{product['id']}')
                print(f"{name} removed completely.")
            else:
                requests.patch(f'{productsUrl}/{product['id']}', json={'quantity':product['quantity']})
                print(f"{name} quantity updated to {product['quantity']}.")
            return
        else:
            print("Error: Insufficient stock.")
            return
    else:
        print("Error: Product not found.")


# Kullanıcıya göre işlemi yönlendiren ana fonksiyon
def handleChoice(choice, role):
    try:
        if role == 'user':
            if choice == '1':
                searchProduct()
            elif choice == '2':
                print('Exiting...')
                return False
            else:
                print('Invalid choice.')
            return True

        if role == 'admin':
            if choice == '1':
                addProduct()
            elif choice == '2':
                removeProduct()
            elif choice == '3':
                searchProduct()
            elif choice == '4':
                print('Exiting...')
                return False
            else:
                print('Invalid choice.')

    except ValueError:
        print('Invalid input. Please enter a valid number.')
    except Exception as e:
        print(f'An error occurred: {e}')
    return True

# Yeni kullanıcı kaydı
def register():
    try:
        newUsername = input('Choose a Username: ')
        user = requests.get(f'{usersUrl}/{newUsername}').json()
        # Kullanıcı adının var olup olmadığını kontrol et
        if (user['status'] == 'success'):
            print('Username already exists.')
            return None, None 
        
        newPassword = input('Choose a Password: ')
        newUserData = {
            "role": "user",
            "name": newUsername,
            "password": newPassword
        }
        requests.post(usersUrl, json=newUserData)
        print('Registration successful.')
        return newUsername, 'user'
    
    except Exception as e:
        print(f'An error occurred: {e}')
        return None, None

def login():
    try:
        username = input('Username: ')
        
        # Kullanıcıyı listede ara
        user = requests.get(f'{usersUrl}/{username}').json()
        if(user['status'] == 'success'):
            user = user['data']
            password = input('Password: ')
            if user['password'] == password:
                return username, user["role"]
            else:
                print('Invalid credentials.')
                return None, None
        else:
            print('User not found.')
            return None, None
    except Exception as e:
        print(f'An error occurred: {e}')
        return None, None
# Kullanıcı kayıt veya giriş seçeneği
print('1: Register\n2: Login')
choice = input('Select an option: ')

if choice == '1':
    username, role = register()
elif choice == '2':
    username, role = login()
else:
    print('Invalid option.')
    exit()

if username and role:
    while True:
        displayMenu(role)
        userChoice = input('Make a choice: ')
        if not handleChoice(userChoice, role):  # Exit seçildiyse uygulamadan çık
            break
else:
    print("Login or Registration failed. Exiting...")
