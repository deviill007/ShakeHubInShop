import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "react-toastify";


const categories = [
  "Shake",
  "Special",
  "Juice",
  "Icecream Cup",
  "Pizza",
  "Burger",
  "Grill Sandwich",
  "Sandwich",
  "Mojito",
];

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orderRes = await fetch("/api/order/get");
        const orderData = await orderRes.json();
  
        if (orderData.success) {
          setOrders(orderData.orders || []); // Ensure orders is always an array
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      }
    }
  
    fetchOrders(); // Initial fetch
  
    const interval = setInterval(fetchOrders, 5000); // Fetch every 5 seconds
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  

  // Fetch Menu Items
  const fetchMenuItems = async () => {
    if (menuVisible) {
      setMenuVisible(false);
      return;
    }
    try {
      const menuRes = await fetch("/api/menu/get");
      const menuData = await menuRes.json();
      setMenuItems(menuData);
      setMenuVisible(true);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  // Handle Order Clearing
  const clearOrder = async (orderId) => {
    if (!confirm("Mark this order as ready?")) return;
    try {
      const res = await fetch("/api/order/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        // Remove the cleared order from the list
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      } else {
        toast.error("Failed to mark order as ready.");
      }
    } catch (error) {
      console.error("Error clearing order:", error);
    }
  };
  

  // Handle Menu Item Deletion
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch("/api/menu/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setMenuItems(menuItems.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  // Edit Existing Menu Item
  const handleUpdateMenuItem = async () => {
    if (!editingItem) return; // Ensure we are editing an item

    setLoading(true);
    try {
      const response = await fetch("/api/menu/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem,
          name,
          price,
          category,
          imageUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Menu item updated successfully!");
        setMenuItems((prevItems) =>
          prevItems.map((item) => (item._id === editingItem ? data.item : item))
        );
        resetForm();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };
  const handleEdit = (item) => {
    setName(item.name);
    setPrice(item.price);
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setEditingItem(item._id);
  };
  
  // Add New Menu Item
  const handleAddMenuItem = async () => {
    if (!name || !price || !category) {
      toast.error("Name, price, and category are required!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/menu/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          imageUrl,
          category,
          available: true,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Menu item added successfully!");
        resetForm();
        setMenuItems([...menuItems, data.item]);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Something went wrong.");
    }

    setLoading(false);
  };

  // Reset Form Fields
  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("");
    setImageUrl("");
    setEditingItem(null);
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>

      {/* Add / Edit Menu Items */}
      <div className="form-section">
        <h2>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="" disabled>
            Select Category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <ImageUploader onUpload={(url) => setImageUrl(url)} />
        {imageUrl && (
          <img src={imageUrl} alt="Uploaded" className="uploaded-image" />
        )}

        {editingItem ? (
          <button onClick={handleUpdateMenuItem} className="edit">
            {loading ? "Updating..." : "Update Menu Item"}
          </button>
        ) : (
          <button onClick={handleAddMenuItem} disabled={loading}>
            {loading ? "Adding..." : "Add Menu Item"}
          </button>
        )}
      </div>

      {/* Show/Hide Menu Button */}
      <button onClick={fetchMenuItems} className="menu-toggle">
        {menuVisible ? "Hide Menu" : "Show Menu"}
      </button>

      {/* Menu Items List */}
      {menuVisible && (
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item._id} className="menu-item">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
              <p>
                {item.name} - ₹{item.price} ({item.category})
              </p>
              <div className="actions">
                <button className="edit" onClick={() => handleEdit(item)}>
                  Edit
                </button>
                <button
                  className="delete"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Orders Section */}
      <h2>Orders</h2>
      <div className="orders-section">
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>
                Table {order.table} - ₹{order.total}
              </h3>
              <p>
                Payment: {order.paymentMethod}{" "}
                {order.paid ? "(Paid)" : "(Unpaid)"}
              </p>
              <ul>
                {order.items.map((item) => (
                  <li key={item._id}>
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => clearOrder(order._id)}
                className="available"
              >
                Clear Order
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
