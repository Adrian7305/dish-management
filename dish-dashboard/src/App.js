import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import your custom CSS file

const App = () => {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/dishes');
      setDishes(response.data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  const togglePublish = async (dishId) => {
    try {
      await axios.post(`http://localhost:3000/api/dishes/${dishId}/togglePublish`);
      fetchDishes(); // Fetch the updated list of dishes
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  return (
    <div className="App">
      <h1 className="title">Dish Dashboard</h1>
      <div className="card-container">
        {dishes.length === 0 ? (
          <p>No dishes available.</p>
        ) : (
          dishes.map((dish) => (
            <div key={dish.dishId} className="card">
              <img src={dish.imageUrl} alt={dish.dishName} className="card-image" />
              <div className="card-details">
                <p className="card-name">{dish.dishName}</p>
                <p className="card-status">{dish.isPublished ? 'Published' : 'Unpublished'}</p>
                <button className="toggle-button" onClick={() => togglePublish(dish.dishId)}>
                  {dish.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
