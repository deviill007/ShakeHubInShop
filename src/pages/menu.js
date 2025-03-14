import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid"; // For generating a unique session ID
import styles from "../styles/menu.module.css";
import { toast } from "react-toastify";

export default function Menu() {
  const router = useRouter();
  const { table } = router.query; // Extract table ID from URL

  const [sessionId, setSessionId] = useState(null); // Store session ID
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Generate or retrieve session ID
  useEffect(() => {
    let storedSessionId = sessionStorage.getItem("sessionId");
    if (!storedSessionId) {
      storedSessionId = uuidv4(); // Generate a new session ID
      sessionStorage.setItem("sessionId", storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Fetch menu items from API
  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch("/api/menu/get");
        const data = await response.json();

        // Categorize menu items
        const categoryMap = {};
        data.forEach((item) => {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = [];
          }
          categoryMap[item.category].push(item);
        });

        setMenuItems(categoryMap);
        setCategories(Object.keys(categoryMap));

        // Initially, all categories are expanded
        const initialCollapseState = Object.keys(categoryMap).reduce(
          (acc, category) => ({ ...acc, [category]: false }),
          {}
        );
        setCollapsedCategories(initialCollapseState);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    }
    fetchMenu();
  }, []);

  // Function to handle placing the order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const orderData = {
      sessionId, // Attach session ID to track the user
      table: table,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
    };

    try {
      const response = await fetch("/api/order/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        toast.success("Order placed successfully!");
        setCart([]); // Clear cart after order
        setIsCartOpen(false);
      } else {
        toast.error("Error placing order!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className={styles.menuContainer}>
      <h2>Shake Hub</h2>

      {/* Search Bar */}
      <input
        type="text"
        className={styles.searchBar}
        placeholder="Search for dishes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
      />

      {/* Categorized Menu */}
      {categories.map((category) => (
        <div key={category} className={styles.categorySection}>
          <div className={styles.categoryHeader}>
            <h2>{category}</h2>
            <button
              className={styles.dropdownButton}
              onClick={() => setCollapsedCategories((prev) => ({
                ...prev,
                [category]: !prev[category],
              }))}
            >
              {collapsedCategories[category] ? "►" : "▼"}
            </button>
          </div>

          {!collapsedCategories[category] && (
            <div className={styles.categoryItems}>
              {menuItems[category]
                .filter((item) => item.name.toLowerCase().includes(searchTerm))
                .map((item) => {
                  const cartItem = cart.find((cartItem) => cartItem._id === item._id);
                  return (
                    <div key={item._id} className={styles.menuItem}>
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} width={100} height={100} />
                      )}
                      <div className={styles.menuItemDetails}>
                        <h3>{item.name}</h3>
                        <p>₹{item.price}</p>
                        

                        {/* Show Add to Cart OR Quantity Buttons */}
                        {cartItem ? (
                          <div className={styles.quantityControls}>
                            <button onClick={() => setCart(prev => prev.map(cartItem =>
                              cartItem._id === item._id
                                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                                : cartItem
                            ).filter(cartItem => cartItem.quantity > 0))}>
                              -
                            </button>
                            <span>{cartItem.quantity}</span>
                            <button onClick={() => setCart(prev => prev.map(cartItem =>
                              cartItem._id === item._id
                                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                : cartItem
                            ))}>
                              +
                            </button>
                          </div>
                        ) : (
                          <button className={styles.addToCart} onClick={() => setCart(prev => [...prev, { ...item, quantity: 1 }])}>
                            Add to Cart
                          </button>
                        )}
                      </div>
                      
                    </div>
                  );
                })}
            </div>
          )}
          <hr />
        </div>
      ))}

      {/* Cart Button */}
      <button className={styles.cartButton} onClick={() => setIsCartOpen(true)}>
        View Cart ({cart.length})
      </button>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className={styles.cartDrawer}>
          <h2>Cart</h2>
          <button onClick={() => setIsCartOpen(false)} style={{ float: "right" }} className={styles.xbutton}>
            ✖
          </button>
          <div>
            {cart.map((item) => (
              <div key={item._id} className={styles.cartItem}>
                <h4>{item.name} - ₹{item.price} x {item.quantity}</h4>
                <div>
                  <button onClick={() => setCart(prev => prev.map(cartItem =>
                    cartItem._id === item._id
                      ? { ...cartItem, quantity: cartItem.quantity - 1 }
                      : cartItem
                  ).filter(cartItem => cartItem.quantity > 0))} className={styles.cartQuantityControls}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => setCart(prev => prev.map(cartItem =>
                    cartItem._id === item._id
                      ? { ...cartItem, quantity: cartItem.quantity + 1 }
                      : cartItem
                  ))} className={styles.cartQuantityControls}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <h3>
            Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
          </h3>
          <button className={styles.checkoutButton} onClick={handlePlaceOrder}>
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}
