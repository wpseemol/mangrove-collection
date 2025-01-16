<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# Mangrove Collection

Mangrove Collection is a modern e-commerce platform, also known as "Ecomarche," developed using Laravel for the backend and React.js for the frontend. This project combines the power of Laravel's robust backend capabilities with React's dynamic user interfaces to deliver a seamless online shopping experience.

## Features

- **Laravel Backend**: Provides a secure and scalable backend with RESTful API development.
- **React.js Frontend**: Delivers a dynamic and responsive user interface.
- **Authentication**: User authentication with role-based access (e.g., Admin, Creator, User).
- **Database Management**: MySQL is used for efficient and reliable data storage.
- **State Management**: React state management for smooth UI interactions.
- **Eloquent ORM**: Simplified database operations using Laravel's ORM.
- **Product Filtering**: Advanced filtering options based on product variants and prices.
- **Shopping Cart**: Intuitive cart functionality with dynamic updates.
- **Responsive Design**: Mobile-first design using CSS frameworks and custom styles.

## Tech Stack

- **Backend**: Laravel (PHP)
- **Frontend**: React.js, Vite
- **Database**: MySQL
- **State Management**: React Context API or Redux (optional)
- **Tools**: Composer, Artisan CLI, npm/yarn

## Installation

### Backend (Laravel)

1. Clone the repository:

    ```bash
    git clone https://github.com/wpseemol/mangrove-collection.git
    ```

2. Navigate to the backend directory:

    ```bash
    cd mangrove-collection/backend
    ```

3. Install Laravel dependencies:

    ```bash
    composer install
    ```

4. Create a `.env` file and configure environment variables:

    ```env
    APP_NAME=Laravel
    APP_ENV=local
    APP_KEY=base64:YourApplicationKeyHere
    APP_DEBUG=true
    APP_URL=http://localhost

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=your_database_name
    DB_USERNAME=your_database_username
    DB_PASSWORD=your_database_password
    ```

5. Generate the application key:

    ```bash
    php artisan key:generate
    ```

6. Run database migrations and seeders:

    ```bash
    php artisan migrate --seed
    ```

7. Start the Laravel development server:
    ```bash
    php artisan serve
    ```

### Frontend (React.js)

1. Navigate to the frontend directory:

    ```bash
    cd mangrove-collection/frontend
    ```

2. Install React dependencies:

    ```bash
    npm install
    ```

3. Start the React development server:

    ```bash
    npm run dev
    ```

4. Access the application:
    ```
    Backend: http://localhost:8000
    Frontend: http://localhost:5173
    ```

## Folder Structure

- **`backend/`**: Laravel application files including routes, controllers, models, and migrations.
- **`frontend/`**: React application files including components, hooks, and pages.
- **`public/`**: Public assets like CSS, JS, and images.
- **`resources/`**: Blade templates (optional) and view files.
- **`routes/`**: API and web route definitions.

## Deployment

1. Set up your environment variables on the server.
2. Build the React application for production:
    ```bash
    npm run build
    ```
3. Deploy the Laravel backend to your server.
4. Serve the React build files with a web server (e.g., Nginx or Apache).

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-name
    ```
3. Commit your changes:
    ```bash
    git commit -m "Add feature description"
    ```
4. Push your branch:
    ```bash
    git push origin feature-name
    ```
5. Open a pull request on GitHub.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Contact

For inquiries or support, please reach out:

- **GitHub**: [wpseemol](https://github.com/wpseemol)
- **Facebook**: [Jui Fashion House](https://www.facebook.com/JuiFashionHouse)

---

Thank you for exploring Mangrove Collection! We hope this platform enhances your e-commerce experience.
