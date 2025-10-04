# Mahama News TV - A Modern News Hub

Mahama News TV is a feature-rich, personalized news application designed for a modern, interactive reading experience. It is built with a powerful backend and a responsive frontend, ready for deployment.

**[Launch the Application on AI Studio]( https://ai.studio/apps/drive/1tCPFs3TxxWgLfyObgS8aiuSjX_cNI0GE
)**  *(Note: Replace `YOUR_APP_ID` with the actual link after deployment)*

---

## ✨ Key Features

This application is packed with advanced features for users, administrators, and publishers.

### For Readers

*   **Personalized Experience**: Log in to access a personalized news feed, save articles, and manage your preferences.
*   **Multi-language Support**: The UI is available in English, French, and Kinyarwanda.
*   **Customizable Theming**: Users can switch between light and dark modes and choose from a variety of accent colors.
*   **Accessibility Controls**: Adjust font size and line height for a comfortable reading experience.
*   **Interactive Content**: Engage with articles through interactive polls and see live results.
*   **Advanced Search**: A full-screen search overlay with real-time suggestions, search history, advanced filtering (date range, sort by), and **voice search** capabilities.
*   **Offline Reading (Premium)**: Premium subscribers can save articles for offline access, ensuring content is available anywhere, anytime.
*   **Collections**: Organize saved articles into custom collections (e.g., "Read Later", "Research").
*   **Engagement**: Like, comment, and share articles across various platforms.
*   **Content Discovery**: A "Surprise Me" feature to discover random articles and a "Related Articles" section to encourage further reading.
*   **Push Notifications**: Opt-in to receive push notifications for breaking news or important updates.

### Monetization & Subscriptions

*   **Premium Content**: Articles can be marked as "Premium", accessible only to subscribers.
*   **Paywall & Subscription Flow**: Non-subscribers are presented with an elegant paywall and a smooth, multi-step subscription modal.
*   **Dynamic Advertising**: A complete ad system displays image or video ads to non-premium users. Ads are served from campaigns managed by administrators and can be targeted by article category. Ad impressions and clicks are tracked for performance analysis.

### For Administrators (Admin Panel)

A comprehensive, secure admin panel provides full control over the platform. The admin account can be accessed with email `` and password ``.

*   **Dashboard**: Get a high-level overview of site analytics, including user activity, engagement trends, top articles, and top categories.
*   **Article Management**: A full CRUD (Create, Read, Update, Delete) interface for managing articles. The rich text editor allows for complex article creation.
*   **User Management**: View all users, manage their roles (User/Admin), and manually adjust their subscription status and duration.
*   **Ad Campaign Management**: Create and manage advertising campaigns, setting budgets, timelines, and targeting specific content categories.
*   **Advertisement Management**: Create, upload, and manage individual image/video ads and assign them to campaigns.
*   **Comment Moderation**: A dedicated queue to approve or reject user-submitted comments before they appear on the site.
*   **Site Settings Management**: Control global site settings, including the site title, logo, favicon, and enable a site-wide **Maintenance Mode**.

### Technical Features

*   **Responsive Design**: The application is fully responsive and provides a seamless experience on devices of all sizes, from mobile phones to desktops.
*   **Robust Backend**: Built with Node.js, Express, and MySQL, providing a secure and scalable foundation. The database includes indexes for improved query performance.
*   **Offline First (App Shell)**: Uses a Service Worker to cache the application shell for faster load times and offline availability.
*   **SEO Optimized**: Generates dynamic meta tags for articles and provides `/api/utils/rss.xml` and `/api/utils/sitemap.xml` endpoints for better search engine indexing and content syndication.

---

## 🛠 Tech Stack

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Backend**: Node.js, Express.js
*   **Database**: MySQL
*   **Real-time Features**: Service Workers for offline caching and push notifications.

---

This application is a complete, deployable solution for a modern digital news platform.
