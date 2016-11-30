# **VUWSA Lost And Found Database**

## **Welcome**

This document will cover the usage of the web application used to manage VUWSA's Lost And Found Database. This database is intended to replace the existing system of an Excel spreadsheet. It aims to improve ease-of-use and accessibility for both staff and students. For new users, please read the Tutorial below.

## **The Team**

The team behind the VUWSA Lost and Found Database consists of five members. These members are: Aaron Pang, Robert Johnson, Stanton Borthwick, Trish Gelido, Priyanka Bhula

Each of these members were responsible for the requirement analysis documents and code created.

## **Architecture**

The application is written in NodeJS with a Jade front-end and a PSQL database to hold all the items.

## **Installation Instructions**

One can use the following Heroku link: https://vuw-lost-and-found.herokuapp.com

Alternatively, download or clone the repository and then use the Terminal to navigate to the folder holding it and execute the command "npm start". Following this, navigate to localhost:3000 in your preferred web browser.

## **Tutorial**

Upon opening the web application, you will be presented with a home screen. On this screen is a sidebar containing "Home" and "Log In" buttons, a search bar at the top of the website and social media links at the footer.  

### **Tiers Of Access**

There are three different tiers of access - Student, Receptionist and Admin. Students can use the "Search" function, but it now show specific item information, rather showing the number of items similar to or matching their search query. They can also use category search to further refine their query, but again, no details about items will be displayed. This is for security reasons, to prevent people from being able to find details of an item that is not theirs and then going to claim it.

### **Logging In**

Many of the functions of the database are disabled unless the user is logged in. This is to prevent misuse of the database and to ensure that only authenticated VUWSA workers can access details of lost items. However, students can still search for items and be returned with general results that can further be investigated at VUWSA's offices.

### **Search**

The search function operates by the user specifying key words in the search bar. Results are returned based on whether these keywords match up with items in the database. Search results can then be narrowed through the use of categories presented after the initial search.

### **Viewing All Items**

It is possible to view all items in the database by clicking the "View All Items" button. A user must be logged in to access and use this function.

### **Adding An Item**

Clicking the "Add Item" button will lead the user to a screen where they can provide item details (Name, Description, Category, Date Received, Campus, Location Found and an Image of the item). Once added, this item will be placed in the database and present in searches. Users must be logged in to access this function.

### **Modifying Item Status**

An item's status can be modified by specifically clicking the "Edit" button on an item. This allows a logged-in user to change the current status of a specfic item, specifying whether it has been returned or disposed of or given to the Police.

### **Database Admin**

This allows a logged-in user to modify the database. Features include: Adding Categories, Removing Categories, Adding and Removing Campuses, Adding and Removing Information fields and permanently deleting items from the database (either by using the item's ID or by specifying a date that will cause all items older than that date to be deleted).

### **View Statistics**

This allows a logged-in user to view Statistics about the Lost and Found Database, such as number of items returned per month and other figures pertaining to VUWSA's Lost and Found operations.

## **Testing**

To perform the test suites designed for the program, simply add the appropriate extension to the URL.
These are:

/countitems

/addremovecategory

/addremovecampus

/addremoveitems


Each of these tests allows the user to test the appropriate section of the code.